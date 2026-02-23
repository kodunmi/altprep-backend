import { Service } from 'typedi';
import axios from 'axios';
import * as crypto from 'crypto';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { TransactionRepository } from '@api/repositories/Payments/TransactionRepository';
import { UserService } from '@api/services/Users/UserService';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { AffiliateProfileRepository } from '@base/api/repositories/Affiliate/AffiliateprofileRepository';
import { AffiliateService } from '../Affiliate/AffiliateService';
import { SmtpProvider } from '@base/infrastructure/services/mail/Providers/SmtpProvider';
import { EmailNotificationTemplateEnum } from '@base/infrastructure/services/mail/Interfaces/templateInterface';
import { MailService } from '@base/infrastructure/services/mail/MailService';

@Service()
export class PaymentService {
  private paystackBaseUrl = 'https://api.paystack.co';
  private paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  constructor(
    @InjectRepository() private transactionRepository: TransactionRepository,
    @InjectRepository() private affiliateProfileRepository: AffiliateProfileRepository,

    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    private userService: UserService,
    private affiliateService: AffiliateService,
  ) {}

  /**
   * Initialize a one-time payment
   */

  public async initializeOneTimePayment(data: {
    userId: number;
    email: string;
    amount: number;
    description?: string;
    firstName?: string;
    lastName?: string;
    referralCode?: string;
  }) {
    try {
      let splitConfig: Record<string, any> = {};

      if (data.referralCode) {
        const affiliateProfile = await this.affiliateProfileRepository.findByCode(data.referralCode);
        if (affiliateProfile?.paystackSubaccountCode && affiliateProfile.isActive) {
          splitConfig = {
            subaccount: affiliateProfile.paystackSubaccountCode,
            transaction_charge: 0, // affiliate gets their % share
            bearer: 'account', // platform bears the Paystack fee
          };
          console.log('[PaymentService] Subaccount split applied:', {
            subaccount: affiliateProfile.paystackSubaccountCode,
            commissionRate: affiliateProfile.commissionRate,
          });
        }
      }

      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email: data.email,
          amount: data.amount * 100, // kobo
          first_name: data.firstName,
          last_name: data.lastName,
          metadata: {
            userId: data.userId,
            description: data.description || 'Registration Fee',
            referralCode: data.referralCode ?? null,
          },
          callback_url: process.env.PAYMENT_CALLBACK_URL,
          ...splitConfig,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const paystackData = response.data.data;

      const transaction = await this.transactionRepository.createTransaction({
        userId: data.userId,
        amount: data.amount,
        status: 'pending',
        paymentMethod: null,
        transactionRef: paystackData.reference,
        description: data.description || 'Registration Fee',
      });

      console.log('[PaymentService] Payment initialized:', {
        transactionId: transaction.id,
        reference: paystackData.reference,
        amount: data.amount,
        hasReferral: !!data.referralCode,
      });

      return {
        authorization_url: paystackData.authorization_url,
        access_code: paystackData.access_code,
        reference: paystackData.reference,
        transactionId: transaction.id,
      };
    } catch (error) {
      console.error('[PaymentService] Payment initialization failed:', error.response?.data || error.message);
      throw new Error('Failed to initialize payment');
    }
  }
  /**
   * Verify payment
   */
  public async verifyPayment(reference: string) {
    try {
      const response = await axios.get(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
      });

      const paymentData = response.data.data;

      const transaction = await this.transactionRepository.findOne({
        where: { transactionRef: reference },
        relations: ['user'],
      });

      if (!transaction) throw new Error('Transaction not found');

      transaction.status = paymentData.status === 'success' ? 'completed' : 'failed';
      transaction.paymentMethod = paymentData.channel;
      await this.transactionRepository.save(transaction);

      if (paymentData.status === 'success') {
        const user = await this.userService.findOneById(transaction.userId);
        user.is_active = true;
        await this.userService.updateOneById(user.id, { is_active: true });

        const referralCode = paymentData.metadata?.referralCode;
        if (referralCode) {
          const rewarded = await this.affiliateService.rewardAffiliate(transaction.userId, paymentData.amount / 100);

          if (rewarded) {
            await this.sendAffiliateCommissionEmail(referralCode, {
              referredUserName: `${user.first_name} ${user.last_name}`,
              amount: paymentData.amount / 100,
            });
          }
        }
      }

      return {
        status: paymentData.status,
        amount: paymentData.amount / 100,
        reference: paymentData.reference,
        transaction,
      };
    } catch (error) {
      console.error('[PaymentService] Payment verification failed:', error.response?.data || error.message);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Handle webhook
   */
  public async handleWebhook(event: any, signature: string) {
    console.log('[PaymentService] Received webhook event:', event.event);

    // Verify signature
    const hash = crypto.createHmac('sha512', this.paystackSecretKey).update(JSON.stringify(event)).digest('hex');

    if (hash !== signature) {
      console.error('[PaymentService] Invalid webhook signature');
      throw new Error('Invalid signature');
    }

    try {
      switch (event.event) {
        case 'charge.success':
          await this.handleChargeSuccess(event.data);
          break;

        default:
          console.log('[PaymentService] Unhandled webhook event:', event.event);
      }

      return { received: true };
    } catch (error) {
      console.error('[PaymentService] Webhook processing failed:', {
        event: event.event,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Handle successful charge webhook
   */
  private async handleChargeSuccess(data: any) {
    console.log('[PaymentService] Processing charge.success webhook:', {
      reference: data.reference,
      amount: data.amount / 100,
      channel: data.channel,
    });

    let transaction = await this.transactionRepository.findOne({
      where: { transactionRef: data.reference },
    });

    if (transaction) {
      transaction.status = 'completed';
      transaction.paymentMethod = data.channel;
      await this.transactionRepository.save(transaction);
      console.log('[PaymentService] Transaction updated:', transaction.id);
    } else {
      transaction = await this.transactionRepository.createTransaction({
        userId: data.metadata?.userId || data.customer?.metadata?.userId,
        amount: data.amount / 100,
        status: 'completed',
        paymentMethod: data.channel,
        transactionRef: data.reference,
        description: data.metadata?.description || 'Payment',
      });
      console.log('[PaymentService] New transaction created:', transaction.id);
    }

    const user = await this.userService.findOneById(transaction.userId);
    user.is_active = true;
    await this.userService.updateOneById(user.id, { is_active: true });

    const referralCode: string | undefined = data.metadata?.referralCode;

    if (referralCode) {
      try {
        const rewarded = await this.affiliateService.rewardAffiliate(transaction.userId, data.amount / 100);

        if (rewarded) {
          await this.sendAffiliateCommissionEmail(referralCode, {
            referredUserName: `${user.first_name} ${user.last_name}`,
            amount: data.amount / 100,
          });
        }
      } catch (err) {
        console.error('[PaymentService] Affiliate reward/email failed:', err.message);
      }
    }

    this.eventDispatcher.dispatch('onPaymentSuccess', { user, transaction });
    console.log('[PaymentService] Charge processed successfully');
  }

  private async sendAffiliateCommissionEmail(referralCode: string, ctx: { referredUserName: string; amount: number }): Promise<void> {
    try {
      const profile = await this.affiliateProfileRepository.findByCode(referralCode);
      if (!profile) return;

      const affiliate = await this.userService.findOneById(profile.userId);
      if (!affiliate) return;

      const commission = (ctx.amount * Number(profile.commissionRate)) / 100;
      const formattedCommission = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }).format(commission);

      const formattedAmount = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }).format(ctx.amount);

      await new MailService()
        .to(affiliate.email)
        .subject('🎉 You just earned a commission on AltEarn!')
        .htmlView(EmailNotificationTemplateEnum.affiliateCommission, {
          affiliateName: affiliate.first_name || affiliate.email.split('@')[0],
          referredUserName: ctx.referredUserName,
          commissionAmount: formattedCommission,
          registrationAmount: formattedAmount,
          commissionRate: profile.commissionRate,
          totalEarnings: new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
          }).format(Number(profile.totalEarnings)),
          bankName: profile.bankName,
          accountNumber: `****${profile.bankAccountNumber?.slice(-4)}`,
          year: new Date().getFullYear(),
        })
        .send();

      console.log('[PaymentService] Affiliate commission email sent to:', affiliate.email);
    } catch (err) {
      console.error('[PaymentService] Failed to send affiliate commission email:', err.message);
    }
  }
}
