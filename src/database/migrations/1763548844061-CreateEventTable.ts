import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEventTable1763548844061 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'events',
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },

          { name: 'title', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'category',
            type: 'enum',
            enum: ['internships', 'events', 'competitions'],
          },
          { name: 'type', type: 'varchar', length: '255', isNullable: true },
          { name: 'organization', type: 'varchar', length: '255', isNullable: true },
          { name: 'location', type: 'varchar', length: '255', isNullable: true },
          { name: 'event_date', type: 'date' },
          { name: 'start_time', type: 'time' },
          { name: 'end_time', type: 'time', isNullable: true },
          { name: 'event_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'meta', type: 'text', isNullable: true },

          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('events');
  }
}
