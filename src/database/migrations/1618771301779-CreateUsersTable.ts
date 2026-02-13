import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUsersTable1618771301779 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'users',
      columns: [
        {
          name: 'id',
          type: 'bigint',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        { name: 'first_name', type: 'varchar', length: '191' },
        { name: 'last_name', type: 'varchar', length: '191' },
        { name: 'email', type: 'varchar', length: '191', isUnique: true },
        { name: 'password', type: 'varchar', length: '191' },
        { name: 'role_id', type: 'bigint' },
        { name: 'bio', type: 'varchar', length: '191', isNullable: true },
        { name: 'phone_number', type: 'varchar', length: '191', isNullable: true },
        { name: 'badge', type: 'varchar', length: '191', isNullable: true },
        { name: 'track', type: 'varchar', length: '191', isNullable: true },
        { name: 'is_active', type: 'boolean', default: true},
        { name: 'avatar_url', type: 'varchar', length: '500', isNullable: true},
        { name: 'track_id', type: 'bigint', isNullable: true},
        {
          name: 'badge_id',
          type: 'bigint',
          isNullable: true,
          comment: 'Badge or achievement earned by the user',
        },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP'},
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
      'users',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
