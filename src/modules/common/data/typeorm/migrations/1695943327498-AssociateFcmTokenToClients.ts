import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AssociateFcmTokenToClients1695943327498
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'fcm_tokens',
        columns: [
          {
            name: 'client_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'fcm_token',
            type: 'varchar',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            name: 'fk_client_id',
            columnNames: ['client_id'],
            referencedTableName: 'clients',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('fcm_tokens');
  }
}
