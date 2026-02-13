import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateCourseTable1762315549723 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'courses',
            columns: [
              {
                name: 'id',
                type: 'bigint',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
              },
              {
                name: 'name',
                type: 'varchar',
                length: '191',
                isUnique: true,
              },
              {
                name: 'short_description',
                type: 'varchar',
                length: '255',
                isNullable: true,
              },
              {
                name: 'long_description',
                type: 'text',
                isNullable: true,
              },
              {
                name: 'video_preview_url',
                type: 'varchar',
                length: '500',
                isNullable: true,
              },
              {
                name: 'thumbnail_url',
                type: 'varchar',
                length: '500',
                isNullable: true,
              },
              {
                name: 'status',
                type: 'enum',
                enum: ['pending', 'completed', 'in_progress'],
                default: `'pending'`,
              },
              {
                name: 'has_certificate',
                type: 'boolean',
                default: false,
              },
              { 
                name: "meta", 
                type: "text", 
                isNullable: true 
              },
              {
                name: 'track_id',
                type: 'bigint',
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
          })

        await queryRunner.createTable(table);

        await queryRunner.createForeignKey(
          'courses',
          new TableForeignKey({
            columnNames: ['track_id'],
            referencedTableName: 'tracks',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        );
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('courses');
    }

}
