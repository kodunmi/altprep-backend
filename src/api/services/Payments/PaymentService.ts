import { Service } from 'typedi';
import axios from 'axios';
import * as crypto from 'crypto';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { TransactionRepository } from '@api/repositories/Payments/TransactionRepository';
import { UserService } from '@api/services/Users/UserService';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class PaymentService {
  private paystackBaseUrl = 'https://api.paystack.co';
  private paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  constructor(
    @InjectRepository() private transactionRepository: TransactionRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    private userService: UserService,
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
  }) {
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email: data.email,
          amount: data.amount * 100, // Convert to kobo
          first_name: data.firstName,
          last_name: data.lastName,
          metadata: {
            userId: data.userId,
            description: data.description || 'Registration Fee',
          },
          callback_url: process.env.PAYMENT_CALLBACK_URL,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const paystackData = response.data.data;

      // Create transaction record
      const transaction = await this.transactionRepository.createTransaction({
        userId: data.userId,
        amount: data.amount,
        status: 'pending',
        paymentMethod: null, // Will be updated on webhook
        transactionRef: paystackData.reference,
        description: data.description || 'Registration Fee',
      });

      console.log('[PaymentService] Payment initialized:', {
        transactionId: transaction.id,
        reference: paystackData.reference,
        amount: data.amount,
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
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      });

      const paymentData = response.data.data;

      // Find and update transaction
      const transaction = await this.transactionRepository.findOne({
        where: { transactionRef: reference },
        relations: ['user'],
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction status and payment method
      transaction.status = paymentData.status === 'success' ? 'completed' : 'failed';
      transaction.paymentMethod = paymentData.channel; // e.g., 'card', 'bank'
      await this.transactionRepository.save(transaction);

      console.log('[PaymentService] Payment verified:', {
        transactionId: transaction.id,
        reference,
        status: transaction.status,
        amount: transaction.amount,
      });

      // Dispatch success event if payment successful
      if (paymentData.status === 'success') {
        const user = await this.userService.findOneById(transaction.userId);

        console.log('[PaymentService] Updating user is_active status:', user.id);
        user.is_active = true;
        await this.userService.updateOneById(user.id, { is_active: true });

        this.eventDispatcher.dispatch('onPaymentSuccess', {
          transaction,
          user,
        });
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

    // Find existing transaction or create new one
    let transaction = await this.transactionRepository.findOne({
      where: { transactionRef: data.reference },
    });

    if (transaction) {
      // Update existing transaction
      transaction.status = 'completed';
      transaction.paymentMethod = data.channel; // e.g., 'card', 'bank'
      await this.transactionRepository.save(transaction);

      console.log('[PaymentService] Transaction updated:', transaction.id);
    } else {
      // Create new transaction if not found (fallback)
      transaction = await this.transactionRepository.createTransaction({
        userId: data.metadata?.userId || data.customer?.metadata?.userId,
        amount: data.amount / 100, // Convert from kobo
        status: 'completed',
        paymentMethod: data.channel,
        transactionRef: data.reference,
        description: data.metadata?.description || 'Payment',
      });

      console.log('[PaymentService] New transaction created:', transaction.id);
    }

    // Get user and dispatch event
    const user = await this.userService.findOneById(transaction.userId);

    // update user is_active status to true

    console.log('[PaymentService] Updating user is_active status:', user.id);
    user.is_active = true;
    await this.userService.updateOneById(user.id, { is_active: true });

    this.eventDispatcher.dispatch('onPaymentSuccess', {
      user,
      transaction,
    });

    console.log('[PaymentService] Charge processed successfully');
  }
}
