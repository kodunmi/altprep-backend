import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../User';

@Entity({ name: 'transactions' })
export class Transaction extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string; // e.g., 'pending', 'completed', 'failed'

  @Column({ nullable: true })
  paymentMethod: string; // e.g., 'card', 'bank_transfer'

  @Column({ nullable: true })
  transactionRef: string; // External reference ID

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.transactions)
  // @JoinColumn({ name: 'userId' })
  user: User;
}
