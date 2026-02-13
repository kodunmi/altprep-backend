import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Event } from './Event';

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'bigint' })
  event_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  institution: string;

  @Column()
  submission_link: string;

  @Column('simple-json', { nullable: true })
  meta: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  /* --------------------  RELATIONSHIPS  -------------------- */

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
