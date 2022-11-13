import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateQueuesTable1668301783745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'queues',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },

          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'priority',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: false,
          },

          {
            name: 'service_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'organization_id',
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

    const foreignKeyOrganizationId = new TableForeignKey({
      columnNames: ['organization_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'organizations',
      onDelete: 'CASCADE',
    });
    const foreignKeyServiceId = new TableForeignKey({
      columnNames: ['service_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'services',
      onDelete: 'CASCADE',
    });

    await queryRunner.createForeignKey('queues', foreignKeyOrganizationId);
    await queryRunner.createForeignKey('queues', foreignKeyServiceId);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('queues');
  }
}
