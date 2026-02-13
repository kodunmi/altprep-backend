import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { NotificationTypeEnum } from '../interfaces/notification/NotificationInterface';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'varchar' })
  type: NotificationTypeEnum;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column("timestamp")
  created_at: Date;

  @Column("timestamp")
  updated_at: Date;

  /* --------------------  RELATIONSHIPS  -------------------- */

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
