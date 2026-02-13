import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateLessonTable1762319859829 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: 'lessons',
            columns: [
              {
                name: 'id',
                type: 'bigint',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
              },
              {
                name: 'course_id',
                type: 'bigint',
              },
              {
                name: 'title',
                type: 'varchar',
                length: '191',
              },
              {
                name: 'content',
                type: 'text',
                isNullable: true,
              },
              {
                name: 'video_url',
                type: 'varchar',
                length: '500',
                isNullable: true,
              },
              {
                name: 'duration',
                type: 'varchar',
                length: '191',
                isNullable: true,
              },
              {
                name: 'order',
                type: 'int',
                default: 0,
              },
              {
                name: 'is_preview',
                type: 'boolean',
                default: false,
              },
              {
                name: 'created_at',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
                onUpdate: 'CURRENT_TIMESTAMP',
              },
            ],
          }),
        );
    
        await queryRunner.createForeignKey(
          'lessons',
          new TableForeignKey({
            columnNames: ['course_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'courses',
            onDelete: 'CASCADE',
          }),
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('lessons');
      }

}
