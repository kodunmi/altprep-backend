import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EventCategoryEnum } from '../interfaces/event/EventInterface';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  category: EventCategoryEnum;

  @Column()
  type: string;

  @Column()
  organization: string;

  @Column()
  location: string;

  @Column()
  event_date: string;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column()
  event_url: string;

  @Column('simple-json', { nullable: true })
  meta: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
