import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lesson } from './Lesson';

@Entity({ name: 'lesson_materials' })
export class LessonMaterial {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  lesson_id: number;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'varchar', length: 500 })
  file_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  file_type?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
  
  @ManyToOne(() => Lesson, (lesson) => lesson.materials)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}
