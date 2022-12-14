import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateClientsPositionInQueesTable1671021533637
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'clients_position_in_queues',
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
            name: 'queue_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'position',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'called_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'attended_by_user',
            type: 'uuid',
            isNullable: true,
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

    const foreignKeyQueueId = new TableForeignKey({
      columnNames: ['queue_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'queues',
      onDelete: 'CASCADE',
    });

    const foreignKeyAttendedByUserId = new TableForeignKey({
      columnNames: ['attended_by_user'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    });

    await queryRunner.createForeignKey(
      'clients_position_in_queues',
      foreignKeyClientId,
    );

    await queryRunner.createForeignKey(
      'clients_position_in_queues',
      foreignKeyQueueId,
    );

    await queryRunner.createForeignKey(
      'clients_position_in_queues',
      foreignKeyAttendedByUserId,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('clients_position_in_queues');
  }
}
