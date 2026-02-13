import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateQuizTable1762325246584 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'quizzes',
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'lesson_id', type: 'bigint' },
          { name: "title", type: "varchar", length: "191" },
          { name: 'time_allowed', type: 'bigint' },
          { name: 'total_score', type: 'int' },
          { name: 'pass_score', type: 'int' },
          { name: "instructions", type: "text", isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP'},
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
      'quizzes',
      new TableForeignKey({
        columnNames: ['lesson_id'],
        referencedTableName: 'lessons',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('quizzes');
  }
}
