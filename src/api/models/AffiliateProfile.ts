import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('affiliate_profiles')
export class AffiliateProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Unique referral code used to generate links
  @Column({ name: 'referral_code', unique: true })
  referralCode: string;

  // Paystack subaccount code e.g. ACCT_xxxxxxx
  @Column({ name: 'paystack_subaccount_code', nullable: true })
  paystackSubaccountCode: string;

  // Paystack subaccount id
  @Column({ name: 'paystack_subaccount_id', nullable: true })
  paystackSubaccountId: string;

  // Bank details for splits
  @Column({ name: 'bank_code', nullable: true })
  bankCode: string;

  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_account_name', nullable: true })
  bankAccountName: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  // Commission percentage (e.g. 10 = 10%)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  commissionRate: number;

  // Cumulative earnings in NGN
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  // Pending (not yet paid out) earnings
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingEarnings: number;

  // Total paid out
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPaidOut: number;

  // Number of successful conversions
  @Column({ name: 'total_conversions', default: 0 })
  totalConversions: number;

  // Number of clicks on the referral link
  @Column({ name: 'total_clicks', default: 0 })
  totalClicks: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
