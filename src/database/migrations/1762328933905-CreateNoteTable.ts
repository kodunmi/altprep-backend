import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateNoteTable1762328933905 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: "notes",
            columns: [
              { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
              { name: "user_id", type: "bigint" },
              { name: "lesson_id", type: "bigint" },
              { name: "content", type: "text" },
              { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
              {
                name: "updated_at",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                onUpdate: "CURRENT_TIMESTAMP",
              },
            ],
          })
        );
    
        await queryRunner.createForeignKey(
          "notes",
          new TableForeignKey({
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          })
        );
    
        await queryRunner.createForeignKey(
          "notes",
          new TableForeignKey({
            columnNames: ["lesson_id"],
            referencedTableName: "lessons",
            referencedColumnNames: ["id"],
          })
        );
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("notes");
    }

}
