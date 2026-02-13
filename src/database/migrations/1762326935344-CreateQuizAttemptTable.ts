import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateQuizAttemptTable1762326935344 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "quiz_attempts",
            columns: [
              { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
              { name: "question_id", type: "bigint" },
              { name: "user_id", type: "bigint" },
              { name: "quiz_id", type: "bigint" },
              { name: "selected_answer", type: "varchar", length: "255" },
              { name: "is_correct", type: "boolean", default: false },
              { name: "attempted_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
            ]
        }));

        await queryRunner.createForeignKey("quiz_attempts", new TableForeignKey({
            columnNames: ["question_id"],
            referencedTableName: "quiz_questions",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
        }));

        await queryRunner.createForeignKey("quiz_attempts", new TableForeignKey({
            columnNames: ["quiz_id"],
            referencedTableName: "quizzes",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
        }));

        await queryRunner.createForeignKey("quiz_attempts", new TableForeignKey({
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('quiz_attempts');
    }

}
