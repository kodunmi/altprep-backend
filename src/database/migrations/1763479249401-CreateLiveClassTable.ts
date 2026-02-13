import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateLiveClassTable1763479249401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'live_classes',
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'date', type: 'date' },
          { name: 'start_time', type: 'time' },
          { name: 'end_time', type: 'time', isNullable: true },
          { name: 'class_url', type: 'varchar', length: '500', isNullable: true },
          { name: "recording_url", type: "varchar", length: "500", isNullable: true },
          { name: 'recording_size', type: 'bigint', isNullable: true },
          { name: 'recording_uploaded_at', type: 'timestamp', isNullable: true },
          { name: 'user_id', type: 'bigint', isNullable: true },
          { name: 'course_id', type: 'bigint', isNullable: true },

          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'live_classes',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'live_classes',
      new TableForeignKey({
        columnNames: ['course_id'],
        referencedTableName: 'courses',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('live_classes');
  }
}
