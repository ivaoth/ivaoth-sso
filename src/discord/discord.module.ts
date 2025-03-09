import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthState } from '../entities/OAuthState.js';
import { User } from '../entities/User.js';
import { IvaoLoginController } from './ivao-login/ivao-login.controller.js';
import { DiscordOauthCallbackController } from './discord-oauth-callback/discord-oauth-callback.controller.js';
import { DiscordApiService } from './discord-api/discord-api.service.js';
import { UtilitiesService } from './utilities/utilities.service.js';
import { UpdateMemberController } from './update-member/update-member.controller.js';
import { NicknameUpdateController } from './nickname-update/nickname-update.controller.js';
import { SubmitConsentController } from './submit-consent/submit-consent.controller.js';
import { InteractionController } from './interaction/interaction.controller.js';
import { DiscordToken } from '../entities/DiscordToken.js';
import { Admin } from '../entities/Admin.js';

interface DiscordModuleConfig {
  discordClientId: string;
  discordClientSecret: string;
  discordCallbackUri: string;
  discordGuildId: string;
  discordBotToken: string;
  discordThisDivisionRole: string;
  discordOtherDivisionRole: string;
  discordThisDivisionStaffRole: string;
  discordOtherDivisionStaffRole: string;
  discordHQStaffRole: string;
  discordVerifiedUserRole: string;
  thisDivision: string;
  thisDivisionFirs: string[];
  discordBotRole: string;
  discordUnverifiedUserRole: string;
  discordUnconsentedRole: string;
  discordManagedRoles: string[];
  discordBotPublicKey: string;
}

@Module({
  controllers: [
    IvaoLoginController,
    DiscordOauthCallbackController,
    UpdateMemberController,
    NicknameUpdateController,
    SubmitConsentController,
    InteractionController
  ],
  providers: [DiscordApiService, UtilitiesService],
  imports: [TypeOrmModule.forFeature([User, OAuthState, DiscordToken, Admin])]
})
export class DiscordModule {
  static fromEnv(): DynamicModule {
    const config = this.getConfigFromEnv();
    return {
      module: DiscordModule,
      providers: [
        { provide: 'DISCORD_CLIENT_ID', useValue: config.discordClientId },
        {
          provide: 'DISCORD_CLIENT_SECRET',
          useValue: config.discordClientSecret
        },
        {
          provide: 'DISCORD_CALLBACK_URI',
          useValue: config.discordCallbackUri
        },
        { provide: 'DISCORD_GUILD_ID', useValue: config.discordGuildId },
        { provide: 'DISCORD_BOT_TOKEN', useValue: config.discordBotToken },
        {
          provide: 'DISCORD_THIS_DIVISION_ROLE',
          useValue: config.discordThisDivisionRole
        },
        {
          provide: 'DISCORD_OTHER_DIVISION_ROLE',
          useValue: config.discordOtherDivisionRole
        },
        {
          provide: 'DISCORD_THIS_DIVISION_STAFF_ROLE',
          useValue: config.discordThisDivisionStaffRole
        },
        {
          provide: 'DISCORD_OTHER_DIVISION_STAFF_ROLE',
          useValue: config.discordOtherDivisionStaffRole
        },
        {
          provide: 'DISCORD_HQ_STAFF_ROLE',
          useValue: config.discordHQStaffRole
        },
        {
          provide: 'DISCORD_VERIFIED_USER_ROLE',
          useValue: config.discordVerifiedUserRole
        },
        { provide: 'THIS_DIVISION', useValue: config.thisDivision },
        { provide: 'THIS_DIVISION_FIRS', useValue: config.thisDivisionFirs },
        { provide: 'DISCORD_BOT_ROLE', useValue: config.discordBotRole },
        {
          provide: 'DISCORD_UNVERIFIED_USER_ROLE',
          useValue: config.discordUnverifiedUserRole
        },
        {
          provide: 'DISCORD_UNCONSENTED_ROLE',
          useValue: config.discordUnconsentedRole
        },
        {
          provide: 'DISCORD_MANAGED_ROLES',
          useValue: config.discordManagedRoles
        },
        {
          provide: 'DISCORD_BOT_PUBLIC_KEY',
          useValue: config.discordBotPublicKey
        }
      ]
    };
  }

  static getConfigFromEnv(): DiscordModuleConfig {
    const discordBotToken = process.env['DISCORD_BOT_TOKEN'];
    const discordCallbackUri = process.env['DISCORD_CALLBACK_URI'];
    const discordClientId = process.env['DISCORD_CLIENT_ID'];
    const discordClientSecret = process.env['DISCORD_CLIENT_SECRET'];
    const discordGuildId = process.env['DISCORD_GUILD_ID'];
    const discordHQStaffRole = process.env['DISCORD_HQ_STAFF_ROLE'];
    const discordOtherDivisionRole = process.env['DISCORD_OTHER_DIVISION_ROLE'];
    const discordOtherDivisionStaffRole = process.env['DISCORD_OTHER_DIVISION_STAFF_ROLE'];
    const discordThisDivisionRole = process.env['DISCORD_THIS_DIVISION_ROLE'];
    const discordThisDivisionStaffRole = process.env['DISCORD_THIS_DIVISION_STAFF_ROLE'];
    const discordVerifiedUserRole = process.env['DISCORD_VERIFIED_USER_ROLE'];
    const thisDivision = process.env['THIS_DIVISION'];
    const thisDivisionFirs = process.env['THIS_DIVISION_FIRS'];
    const discordBotRole = process.env['DISCORD_BOT_ROLE'];
    const discordUnverifiedUserRole = process.env['DISCORD_UNVERIFIED_USER_ROLE'];
    const discordUnconsentedRole = process.env['DISCORD_UNCONSENTED_ROLE'];
    const discordManagedRoles = process.env['DISCORD_MANAGED_ROLES'];
    const discordBotPublicKey = process.env['DISCORD_BOT_PUBLIC_KEY'];
    if (
      discordClientId &&
      discordClientSecret &&
      discordCallbackUri &&
      discordGuildId &&
      discordBotToken &&
      discordThisDivisionRole &&
      discordOtherDivisionRole &&
      discordThisDivisionStaffRole &&
      discordOtherDivisionStaffRole &&
      discordHQStaffRole &&
      discordVerifiedUserRole &&
      thisDivision &&
      thisDivisionFirs &&
      discordBotRole &&
      discordUnverifiedUserRole &&
      discordUnconsentedRole &&
      discordManagedRoles &&
      discordBotPublicKey
    )
      return {
        discordClientId,
        discordClientSecret,
        discordCallbackUri,
        discordGuildId,
        discordBotToken,
        discordThisDivisionRole,
        discordOtherDivisionRole,
        discordThisDivisionStaffRole,
        discordOtherDivisionStaffRole,
        discordHQStaffRole,
        discordVerifiedUserRole,
        thisDivision,
        thisDivisionFirs: thisDivisionFirs.split(':'),
        discordBotRole,
        discordUnverifiedUserRole,
        discordUnconsentedRole,
        discordManagedRoles: discordManagedRoles.split(':'),
        discordBotPublicKey
      };
    else throw new Error('Misconfigured environment');
  }
}
