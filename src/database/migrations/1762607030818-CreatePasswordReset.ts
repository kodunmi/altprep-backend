import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreatePasswordReset1762607030818 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
          name: 'password_resets',
          columns: [
            { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'email', type: 'varchar', length: '191' },
            { name: 'token', type: 'varchar', length: '255' },
            { name: 'expires_at', type: 'timestamp' },
            { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
          ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('password_resets');
    }
}
