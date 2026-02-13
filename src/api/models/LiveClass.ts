import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity('live_classes')
export class LiveClass {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  date: string;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column()
  class_url: string;
  
  @Column()
  recording_url: string;
  
  @Column()
  recording_size: number;
  
  @Column()
  recording_uploaded_at: Date;

  @Column()
  user_id: number;

  @Column()
  course_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
