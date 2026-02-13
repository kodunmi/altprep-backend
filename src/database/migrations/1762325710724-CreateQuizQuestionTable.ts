import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateQuizQuestionTable1762325710724 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "quiz_questions",
            columns: [
              { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
              { name: "quiz_id", type: "bigint" },
              { name: "question_text", type: "text" },
              { name: "type", type: "varchar", length: "255" },
              { name: "options_json", type: "text", isNullable: true },
              { name: "answer", type: "varchar", length: "255" },
              { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" }
            ]
        }));

        await queryRunner.createForeignKey("quiz_questions", new TableForeignKey({
            columnNames: ["quiz_id"],
            referencedTableName: "quizzes",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('quiz_questions');
    }

}
