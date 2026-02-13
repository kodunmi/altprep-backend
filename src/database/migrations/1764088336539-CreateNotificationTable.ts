import { MigrationInterface, QueryRunner, TableForeignKey, Table } from 'typeorm';

export class CreateNotificationTable1764088336539 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'notifications',
      columns: [
        {
          name: 'id',
          type: 'bigint',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'user_id',
          type: 'bigint',
          isNullable: true,
        },
        {
          name: 'title',
          type: 'varchar',
          length: '255',
        },
        {
          name: 'category',
          type: 'varchar',
          length: '100',
        },
        {
          name: 'message',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'details',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'read',
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
    });

    await queryRunner.createTable(table);

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
