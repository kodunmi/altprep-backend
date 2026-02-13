import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Quiz } from "./Quiz";

@Entity({ name: "quiz_questions" })
export class QuizQuestion {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  quiz_id: number;
  
  @Column()
  question_text: string;
  
  @Column()
  type: string;

  @Column()
  options_json: string | null;
  
  @Column()
  answer: string;
  
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

    /* --------------------  RELATIONSHIPS  -------------------- */

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  @JoinColumn({ name: "quiz_id" })
  quiz: Quiz;
}
