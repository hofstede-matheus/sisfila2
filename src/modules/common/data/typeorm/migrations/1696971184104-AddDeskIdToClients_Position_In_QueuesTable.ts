import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeskIdToClientsPositionInQueuesTable1696971184104
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients_position_in_queues" ADD COLUMN "desk_id" uuid;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients_position_in_queues" DROP COLUMN "desk_id";
        `);
  }
}
