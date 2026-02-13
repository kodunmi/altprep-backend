import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateBadgeTable1761750210824 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: 'badges',
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
              },
              {
                name: 'description',
                type: 'text',
                isNullable: true,
              },
              {
                name: 'icon_url',
                type: 'varchar',
                length: '500',
                isNullable: true,
                comment: 'Badge icon or image link',
              },
              {
                name: 'level',
                type: 'varchar',
                length: '50',
                isNullable: true,
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
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('badges');
    }

}
