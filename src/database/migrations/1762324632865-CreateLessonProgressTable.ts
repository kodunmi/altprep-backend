import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateLessonProgressTable1762324632865 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: "lesson_progress",
            columns: [
              { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
              { name: "user_id", type: "bigint" },
              { name: "lesson_id", type: "bigint" },
              { name: "progress_seconds", type: "int", default: 0 },
              { name: "completed", type: "boolean", default: false },
              { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" }
            ]
          })
        );
    
        await queryRunner.createForeignKey("lesson_progress", new TableForeignKey({
          columnNames: ["user_id"],
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE"
        }));
    
        await queryRunner.createForeignKey("lesson_progress", new TableForeignKey({
          columnNames: ["lesson_id"],
          referencedTableName: "lessons",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE"
        }));
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("lesson_progress");
    }

}
