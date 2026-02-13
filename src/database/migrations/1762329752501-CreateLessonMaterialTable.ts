import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateLessonMaterialTable1762329752501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lesson_materials',
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'lesson_id', type: 'bigint' },
          { name: 'file_name', type: 'varchar', length: '255' },
          { name: 'file_url', type: 'varchar', length: '500' },
          { name: 'file_type', type: 'varchar', length: '100', isNullable: true },
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
      'lesson_materials',
      new TableForeignKey({
        columnNames: ['lesson_id'],
        referencedTableName: 'lessons',
        referencedColumnNames: ['id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lesson_materials');
  }
}
