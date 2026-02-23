import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The affiliate who owns this referral link
  @Column({ name: 'referrer_id' })
  referrerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referrer_id' })
  referrer: User;

  // The user who was referred
  @Column({ name: 'referred_user_id', nullable: true })
  referredUserId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'referred_user_id' })
  referredUser: User;

  @Column({ name: 'referral_code' })
  referralCode: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'converted' | 'rewarded';

  // Amount earned from this referral (in NGN)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionEarned: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
