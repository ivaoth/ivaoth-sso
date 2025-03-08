import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { DiscordInviteModule } from './discord-invite/discord-invite.module';
import { Admin } from './entities/Admin';
import { OAuthState } from './entities/OAuthState';
import { User } from './entities/User';
import { APIKeyMiddleware } from './middlewares/APIKey.middleware';
import { CreateAuthRequestTable1557146563440 } from './migrations/1557146563440-CreateAuthRequestTable';
import { CreateUserTable1557153360741 } from './migrations/1557153360741-CreateUserTable';
import { CreateNicknameOnUsers1557162358099 } from './migrations/1557162358099-CreateNicknameOnUsers';
import { CreateAdminTable1588883056001 } from './migrations/1588883056001-CreateAdminTable';
import { CreateOAuthStateTable1605167513355 } from './migrations/1605167513355-CreateOAuthStateTable';
import { RemoveAuthRequest1608128480347 } from './migrations/1608128480347-RemoveAuthRequest';
import { AddConsentTime1621007020175 } from './migrations/1621007020175-AddConsentTime';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [resolve(__dirname, '..', '.env')]
    }),
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
