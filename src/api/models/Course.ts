import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';
  
import { Track } from './Track';
import { Lesson } from './Lesson';
  
@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    short_description: string;

    @Column()
    long_description: string;

    @Column()
    video_preview_url: string;

    @Column()
    thumbnail_url: string;

    @Column()
    status: 'pending' | 'completed' | 'in_progress';

    @Column()
    meta: string | null;

    @Column()
    has_certificate: boolean;

    @Column()
    track_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    /* --------------------  RELATIONSHIPS  -------------------- */

    @ManyToOne(() => Track, (track) => track.courses)
    @JoinColumn({ name: 'track_id' })
    track: Track;

    @OneToMany(() => Lesson, (lesson) => lesson.course)
    lessons: Lesson[];
}
  