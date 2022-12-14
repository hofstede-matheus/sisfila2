import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateGroupsFromQueuesTable1671044099615
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'groups_from_queues',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },

          {
            name: 'group_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'queue_id',
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

    const foreignKeyGroupId = new TableForeignKey({
      columnNames: ['group_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'groups',
      onDelete: 'CASCADE',
    });

    const foreignKeyQueueId = new TableForeignKey({
      columnNames: ['queue_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'queues',
      onDelete: 'CASCADE',
    });

    await queryRunner.createForeignKey('groups_from_queues', foreignKeyGroupId);

    await queryRunner.createForeignKey('groups_from_queues', foreignKeyQueueId);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('groups_from_queues');
  }
}
