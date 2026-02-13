// src/entities/LessonProgress.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Lesson } from "./Lesson";

@Entity({ name: "lesson_progress" })
export class LessonProgress {

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  progress_seconds: number;

  @Column()
  user_id: number;

  @Column()
  lesson_id: number;

  @Column()
  completed: boolean;

  @Column()
  updated_at: Date;

    /* --------------------  RELATIONSHIPS  -------------------- */

  @ManyToOne(() => Lesson, (lesson) => lesson.progress)
  @JoinColumn({ name: "lesson_id" })
  lesson: Lesson;

}
