import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Exclude, Expose } from 'class-transformer';
import { Role } from './Role';
import { HashService } from '@base/infrastructure/services/hash/HashService';
import { Track } from './Track';
import { Badge } from './Badge';
import { Transaction } from './Payments/Transaction';

@Entity({ name: 'users' })
export class User extends EntityBase {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  role_id: number;

  @Column({
    nullable: true,
  })
  phone_number?: string;

  @Column({
    default: false,
  })
  is_active: boolean;

  @Column({
    nullable: true,
  })
  bio?: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatar_url?: string;

  @Column({ name: 'track_id', type: 'bigint', nullable: true })
  track_id?: number;

  @Column({ name: 'badge_id', type: 'bigint', nullable: true })
  badge_id?: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verificationCode: number;

  @BeforeInsert()
  async setVerificationCode() {
    if (!this.verificationCode) {
      this.verificationCode = Math.floor(100000 + Math.random() * 900000);
    }
  }

  @BeforeInsert()
  async setEmail() {
    if (this.email) this.email = this.email.toLowerCase();
  }

  /* --------------------  RELATIONSHIPS  -------------------- */

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @Expose({ name: 'full_name' })
  get fullName() {
    return this.first_name + ' ' + this.last_name;
  }

  @BeforeInsert()
  async setPassword() {
    if (this.password) this.password = await new HashService().make(this.password);
  }

  @BeforeInsert()
  async setDefaultRole() {
    const roleId = this.role_id ? this.role_id : 2;

    this.role_id = roleId;
  }

  /* --------------------  RELATIONSHIPS  -------------------- */

  @ManyToOne(() => Track, (track) => track.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'track_id' })
  track?: Track;

  @ManyToOne(() => Badge, (badge) => badge.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'badge_id' })
  badge?: Badge;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}
