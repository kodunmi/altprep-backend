import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Course } from "./Course";

@Entity("certificates")
export class Certificate {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("bigint")
  user_id: number;

  @Column("bigint")
  course_id: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  certificate_url?: string;

  @Column("timestamp")
  issued_at: Date;

  @Column("timestamp")
  created_at: Date;

  @Column("timestamp")
  updated_at: Date;

    /* --------------------  RELATIONSHIPS  -------------------- */

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course: Course;
}
