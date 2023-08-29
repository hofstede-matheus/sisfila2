import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateClientsInGroupsTable1670521036475
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'clients_in_groups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },

          {
            name: 'client_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'group_id',
            type: 'uuid',
            isNullable: false,
          },

          // TIMESTAMP
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    const foreignKeyClientId = new TableForeignKey({
      columnNames: ['client_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'clients',
      onDelete: 'CASCADE',
    });

    const foreignKeyGroupId = new TableForeignKey({
      columnNames: ['group_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'groups',
      onDelete: 'CASCADE',
    });

    await queryRunner.createForeignKey('clients_in_groups', foreignKeyClientId);
    await queryRunner.createForeignKey('clients_in_groups', foreignKeyGroupId);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('clients_in_groups');
  }
}
