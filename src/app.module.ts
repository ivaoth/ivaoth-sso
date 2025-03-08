import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { AppController } from './app.controller.js';
import { DiscordInviteModule } from './discord-invite/discord-invite.module.js';
import { Admin } from './entities/Admin.js';
import { OAuthState } from './entities/OAuthState.js';
import { User } from './entities/User.js';
import { APIKeyMiddleware } from './middlewares/APIKey.middleware.js';
import { CreateAuthRequestTable1557146563440 } from './migrations/1557146563440-CreateAuthRequestTable.js';
import { CreateUserTable1557153360741 } from './migrations/1557153360741-CreateUserTable.js';
import { CreateNicknameOnUsers1557162358099 } from './migrations/1557162358099-CreateNicknameOnUsers.js';
import { CreateAdminTable1588883056001 } from './migrations/1588883056001-CreateAdminTable.js';
import { CreateOAuthStateTable1605167513355 } from './migrations/1605167513355-CreateOAuthStateTable.js';
import { RemoveAuthRequest1608128480347 } from './migrations/1608128480347-RemoveAuthRequest.js';
import { AddConsentTime1621007020175 } from './migrations/1621007020175-AddConsentTime.js';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: [resolve(import.meta.dirname, '..', '.env')] }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      timezone: 'Z',
      host: process.env['DB_HOST'],
      username: process.env['DB_USERNAME'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_NAME'],
      entities: [User, Admin, OAuthState],
      migrations: [
        CreateAuthRequestTable1557146563440,
        CreateUserTable1557153360741,
        CreateNicknameOnUsers1557162358099,
        CreateAdminTable1588883056001,
        CreateOAuthStateTable1605167513355,
        RemoveAuthRequest1608128480347,
        AddConsentTime1621007020175
      ],
      migrationsRun: true
    }),
    TypeOrmModule.forFeature([User, Admin, OAuthState]),
    DiscordInviteModule.fromEnv()
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer {
    return consumer
      .apply(APIKeyMiddleware)
      .exclude('discord', 'discord-invite', 'discord-callback', 'ping')
      .forRoutes(AppController);
  }
}
