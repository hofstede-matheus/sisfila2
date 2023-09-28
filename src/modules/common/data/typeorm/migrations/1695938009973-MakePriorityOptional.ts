import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePriorityOptional1695938009973 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "queues" ALTER COLUMN "priority" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "queues" ALTER COLUMN "priority" SET NOT NULL`,
    );
  }
}
