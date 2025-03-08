import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDiscordToken1741475841953 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'discord_token',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'token',
            type: 'text',
            isNullable: false
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false
          }
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onUpdate: 'cascade',
            onDelete: 'cascade'
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('discord_token');
  }
}
