import { Service } from 'typedi';
import axios from 'axios';
import * as crypto from 'crypto';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { UserService } from '@api/services/Users/UserService';
import { AffiliateProfileRepository } from '@base/api/repositories/Affiliate/AffiliateprofileRepository';
import { ReferralRepository } from '@base/api/repositories/Affiliate/Referralrepository';
import { AffiliateProfile } from '@base/api/models/AffiliateProfile';
import { Referral } from '@base/api/models/Referral';

const PAYSTACK_BASE = 'https://api.paystack.co';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

const paystackHeaders = {
  Authorization: `Bearer ${PAYSTACK_SECRET}`,
  'Content-Type': 'application/json',
};

@Service()
export class AffiliateService {
  constructor(
    @InjectRepository() private affiliateRepo: AffiliateProfileRepository,
    @InjectRepository() private referralRepo: ReferralRepository,
    private userService: UserService,
  ) {}

  // ─── Generate unique referral code ───────────────────────────────────────

  private generateReferralCode(prefix: string): string {
    const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix.toUpperCase().slice(0, 4)}-${rand}`;
  }

  // ─── Register affiliate & create Paystack subaccount ─────────────────────

  public async registerAffiliate(data: {
    userId: number;
    businessName: string;
    bankCode: string;
    accountNumber: string;
    commissionRate?: number;
  }): Promise<AffiliateProfile> {
    // Check if already registered
    const existing = await this.affiliateRepo.findByUserId(data.userId);
    if (existing) throw new Error('User is already registered as an affiliate');

    const user = await this.userService.findOneById(data.userId);
    if (!user) throw new Error('User not found');

    // Verify bank account with Paystack
    const verifyRes = await axios.get(`${PAYSTACK_BASE}/bank/resolve?account_number=${data.accountNumber}&bank_code=${data.bankCode}`, {
      headers: paystackHeaders,
    });
    const accountName: string = verifyRes.data.data.account_name;

    // Create Paystack subaccount
    const subaccountRes = await axios.post(
      `${PAYSTACK_BASE}/subaccount`,
      {
        business_name: data.businessName || `${user.first_name} ${user.last_name}`,
        settlement_bank: data.bankCode,
        account_number: data.accountNumber,
        percentage_charge: data.commissionRate ?? 10, // percentage split to affiliate
        description: `AltEarn affiliate subaccount for user ${data.userId}`,
        primary_contact_email: user.email,
        primary_contact_name: `${user.first_name} ${user.last_name}`,
      },
      { headers: paystackHeaders },
    );

    const subData = subaccountRes.data.data;

    // Generate unique referral code
    let referralCode = this.generateReferralCode(user.first_name);
    while (await this.affiliateRepo.findByCode(referralCode)) {
      referralCode = this.generateReferralCode(user.first_name);
    }

    // Save profile
    const profile = this.affiliateRepo.create({
      userId: data.userId,
      referralCode,
      paystackSubaccountCode: subData.subaccount_code,
      paystackSubaccountId: String(subData.id),
      bankCode: data.bankCode,
      bankAccountNumber: data.accountNumber,
      bankAccountName: accountName,
      bankName: subData.settlement_bank,
      commissionRate: data.commissionRate ?? 10,
    });

    return this.affiliateRepo.save(profile);
  }

  public async trackClick(referralCode: string): Promise<void> {
    const profile = await this.affiliateRepo.findByCode(referralCode);
    if (!profile || !profile.isActive) return;
    profile.totalClicks += 1;
    await this.affiliateRepo.save(profile);
  }

  public async createReferralEntry(referralCode: string, referredUserId: number): Promise<Referral | null> {
    const profile = await this.affiliateRepo.findByCode(referralCode);
    if (!profile || !profile.isActive) return null;

    // Don't allow self-referral
    if (profile.userId === referredUserId) return null;

    const referral = await this.referralRepo.createReferral({
      referrerId: profile.userId,
      referredUserId,
      referralCode,
      status: 'pending',
      commissionEarned: 0,
    });

    return referral;
  }

  public async rewardAffiliate(referredUserId: number, paymentAmount: number): Promise<boolean> {
    // Find the pending referral for this user
    const referral = await this.referralRepo.findOne({
      where: { referredUserId, status: 'pending' },
    });

    if (!referral) {
      console.log(
        '[AffiliateService] rewardAffiliate: no pending referral found for user',
        referredUserId,
        '— skipping (already rewarded or not referred)',
      );
      return false;
    }

    const profile = await this.affiliateRepo.findByUserId(referral.referrerId);
    if (!profile) {
      console.warn('[AffiliateService] rewardAffiliate: affiliate profile not found for referrer', referral.referrerId);
      return false;
    }

    const commission = (paymentAmount * Number(profile.commissionRate)) / 100;

    referral.status = 'rewarded';
    referral.commissionEarned = commission;
    await this.referralRepo.save(referral);

    // Update affiliate totals
    profile.totalEarnings = Number(profile.totalEarnings) + commission;
    profile.pendingEarnings = Number(profile.pendingEarnings) + commission;
    profile.totalConversions += 1;
    await this.affiliateRepo.save(profile);

    console.log('[AffiliateService] Commission awarded:', {
      affiliateUserId: profile.userId,
      referredUserId,
      commission,
      totalEarnings: profile.totalEarnings,
    });

    return true; // caller should only send email when this is true
  }

  public async getAffiliateDashboard(userId: number) {
    const profile = await this.affiliateRepo.findByUserId(userId);
    if (!profile) throw new Error('Affiliate profile not found');

    const referrals = await this.referralRepo.findByReferrerId(userId);

    return {
      profile: {
        id: profile.id,
        referralCode: profile.referralCode,
        referralLink: `${process.env.APP_URL}/register?ref=${profile.referralCode}`,
        commissionRate: profile.commissionRate,
        totalEarnings: profile.totalEarnings,
        pendingEarnings: profile.pendingEarnings,
        totalPaidOut: profile.totalPaidOut,
        totalConversions: profile.totalConversions,
        totalClicks: profile.totalClicks,
        conversionRate: profile.totalClicks > 0 ? ((profile.totalConversions / profile.totalClicks) * 100).toFixed(1) : '0.0',
        bank: {
          accountName: profile.bankAccountName,
          accountNumber: profile.bankAccountNumber,
          bankName: profile.bankName,
        },
        paystackSubaccountCode: profile.paystackSubaccountCode,
        isActive: profile.isActive,
      },
      referrals: referrals.map((r) => ({
        id: r.id,
        referredUser: r.referredUser
          ? {
              name: `${r.referredUser.first_name} ${r.referredUser.last_name}`,
              email: r.referredUser.email,
            }
          : null,
        status: r.status,
        commissionEarned: r.commissionEarned,
        createdAt: r.createdAt,
      })),
    };
  }

  public async getAllAffiliates(page = 1, limit = 20) {
    const [affiliates, total] = await this.affiliateRepo.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: affiliates.map((a) => ({
        id: a.id,
        userId: a.userId,
        name: `${a.user?.first_name} ${a.user?.last_name}`,
        email: a.user?.email,
        referralCode: a.referralCode,
        commissionRate: a.commissionRate,
        totalEarnings: a.totalEarnings,
        totalConversions: a.totalConversions,
        totalClicks: a.totalClicks,
        isActive: a.isActive,
        createdAt: a.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  public async syncSubaccountEarnings(userId: number): Promise<void> {
    const profile = await this.affiliateRepo.findByUserId(userId);
    if (!profile?.paystackSubaccountCode) return;

    // Fetch transactions split to this subaccount from Paystack
    const res = await axios.get(`${PAYSTACK_BASE}/transaction?subaccount=${profile.paystackSubaccountCode}&status=success&perPage=100`, {
      headers: paystackHeaders,
    });

    const transactions = res.data.data || [];
    const totalFromPaystack = transactions.reduce((sum: number, t: any) => sum + (t.split_amount || 0) / 100, 0);

    console.log('[AffiliateService] Paystack subaccount sync:', {
      userId,
      subaccount: profile.paystackSubaccountCode,
      totalFromPaystack,
    });

    // You can update totals here if you prefer Paystack as the source of truth
    profile.totalEarnings = totalFromPaystack;
    await this.affiliateRepo.save(profile);
  }

  // ─── Get Paystack banks list ──────────────────────────────────────────────

  public async getBanks() {
    const res = await axios.get(`${PAYSTACK_BASE}/bank?country=nigeria&perPage=100`, {
      headers: paystackHeaders,
    });
    return res.data.data.map((b: any) => ({ name: b.name, code: b.code }));
  }

  // ─── Verify bank account ─────────────────────────────────────────────────

  public async verifyBankAccount(accountNumber: string, bankCode: string) {
    const res = await axios.get(`${PAYSTACK_BASE}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, { headers: paystackHeaders });
    return res.data.data;
  }
}
