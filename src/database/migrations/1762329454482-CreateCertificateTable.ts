import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateCertificateTable1762329454482 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: "certificates",
            columns: [
              { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
              { name: "user_id", type: "bigint" },
              { name: "course_id", type: "bigint" },
              { name: "certificate_url", type: "varchar", length: "255", isNullable: true },
              { name: "issued_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
              {
                name: "created_at",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
              },
              {
                name: "updated_at",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                onUpdate: "CURRENT_TIMESTAMP",
              },
            ],
            uniques: [
              { columnNames: ["user_id", "course_id"] }
            ],
          })
        );
    
        await queryRunner.createForeignKey("certificates", new TableForeignKey({
          columnNames: ["user_id"],
          referencedTableName: "users",
          referencedColumnNames: ["id"],
        }));
    
        await queryRunner.createForeignKey("certificates", new TableForeignKey({
          columnNames: ["course_id"],
          referencedTableName: "courses",
          referencedColumnNames: ["id"],
        }));
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("certificates");
    }

}
