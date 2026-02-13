import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { QuizQuestion } from "./QuizQuestion";
import { User } from "./User";
import { Quiz } from "./Quiz";

@Entity("quiz_attempts")
export class QuizAttempt {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column()
  question_id: number;
  
  @Column()
  quiz_id: number;
  
  @Column("bigint")
  user_id: number;
  
  @Column("varchar")
  selected_answer: string;
  
  @Column("boolean")
  is_correct: boolean;
  
  @Column("timestamp")
  attempted_at: Date;
  
  /* --------------------  RELATIONSHIPS  -------------------- */
  
  @ManyToOne(() => QuizQuestion)
  @JoinColumn({ name: "question_id" })
  question: QuizQuestion;

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  @JoinColumn({ name: "quiz_id" })
  quiz: Quiz;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}
