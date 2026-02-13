import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Lesson } from "./Lesson";

@Entity("notes")
export class Note {
    @PrimaryGeneratedColumn("increment", { type: "bigint" })
    id: number;

    @Column("bigint")
    user_id: number;

    @Column("bigint")
    lesson_id: number;

    @Column("text")
    content: string;

    @Column("timestamp")
    created_at: Date;

    @Column("timestamp")
    updated_at: Date;

    /* --------------------  RELATIONSHIPS  -------------------- */

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Lesson)
    @JoinColumn({ name: "lesson_id" })
    lesson: Lesson;
}
