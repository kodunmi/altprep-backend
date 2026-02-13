import { MigrationInterface, QueryRunner, Table, TableForeignKey} from 'typeorm';

export class CreateEventRegistrationTable1763560116124 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'event_registrations',
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'event_id', type: 'bigint' },
          { name: 'user_id', type: 'bigint' },
          { name: 'first_name', type: 'varchar', length: '150' },
          { name: 'last_name', type: 'varchar', length: '150' },
          { name: 'email', type: 'varchar', length: '200' },
          { name: 'phone', type: 'varchar', length: '50', isNullable: true },
          { name: 'institution', type: 'varchar', length: '255', isNullable: true },
          { name: 'submission_link', type: 'text', isNullable: true },
          { name: 'meta', type: 'text', isNullable: true },
          { name: "payment_reference", type: "varchar", length: "255", isNullable: true },

          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'event_registrations',
      new TableForeignKey({
        columnNames: ['event_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'events',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'event_registrations',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('event_registrations');
  }
}
