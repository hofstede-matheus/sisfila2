import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsSuperAdminToUsersTable1668633013072
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'is_super_admin',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'is_super_admin');
  }
}
