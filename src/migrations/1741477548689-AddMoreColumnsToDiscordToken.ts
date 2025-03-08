import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMoreColumnsToDiscordToken1741477548689 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('discord_token', 'token', 'access_token');
    await queryRunner.addColumns('discord_token', [
      new TableColumn({
        name: 'refresh_token',
        type: 'text',
        isNullable: false
      }),
      new TableColumn({
        name: 'expires_at',
        type: 'datetime',
        isNullable: false
      })
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('discord_token', ['refresh_token', 'expires_at']);
    await queryRunner.renameColumn('discord_token', 'access_token', 'token');
  }
}
