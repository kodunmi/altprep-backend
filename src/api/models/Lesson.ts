import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToMany
  } from 'typeorm';
import { Course } from './Course';
import { LessonProgress } from './LessonProgress';
import { Quiz } from './Quiz';
import { LessonMaterial } from './LessonMaterial';
  
@Entity('lessons')
export class Lesson {
        
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    course_id: number;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column({ nullable: true })
    video_url: string;

    @Column({ nullable: true })
    duration: string;

    @Column()
    order: number;

    @Column()
    is_preview: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    /* --------------------  RELATIONSHIPS  -------------------- */

    @ManyToOne(() => Course, (course) => course.lessons)
    @JoinColumn({ name: 'course_id' })
    course: Course;

    @OneToMany(() => LessonProgress, (progress) => progress.lesson)
    progress: LessonProgress[];

    @OneToMany(() => Quiz, (quiz) => quiz.lesson)
    quizzes: Quiz[]

    @OneToMany(() => LessonMaterial, (material) => material.lesson)
    materials: LessonMaterial[];
}
  