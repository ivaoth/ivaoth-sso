import { REST } from '@discordjs/rest';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  RESTGetAPICurrentUserResult,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildMembersResult,
  RESTPatchAPIGuildMemberJSONBody,
  RESTPostOAuth2AccessTokenURLEncodedData,
  RESTPostOAuth2RefreshTokenURLEncodedData,
  RESTPostOAuth2RefreshTokenResult,
  RESTPostOAuth2AccessTokenResult,
  RESTPutAPIGuildMemberJSONBody,
  Routes,
  RESTPutAPICurrentUserApplicationRoleConnectionJSONBody
} from 'discord-api-types/v10';
import qs from 'qs';
import { User } from '../../entities/User.js';
import { UtilitiesService } from '../utilities/utilities.service.js';
import { WrapperType } from '../../interfaces/wrapper-type.js';

@Injectable()
export class DiscordApiService {
  private rest: REST;
  private logger = new Logger(DiscordApiService.name);
  private cachedAllMembers: RESTGetAPIGuildMembersResult = [];

  constructor(
    @Inject(forwardRef(() => UtilitiesService)) private utils: WrapperType<UtilitiesService>,
    @Inject('DISCORD_CLIENT_ID') private discordClientId: string,
    @Inject('DISCORD_CLIENT_SECRET') private discordClientSecret: string,
    @Inject('DISCORD_CALLBACK_URI') private discordCallbackUri: string,
    @Inject('DISCORD_GUILD_ID') private discordGuildId: string,
    @Inject('DISCORD_BOT_TOKEN') discordBotToken: string,
    @Inject('DISCORD_BOT_ROLE') private discordBotRole: string,
    @Inject('DISCORD_MANAGED_ROLES') private discordManagedRoles: string[]
  ) {
    this.rest = new REST({ version: '10' }).setToken(discordBotToken);
  }

  /**
   * Get Discord User ID from an access token
   * @param token_type Token type
   * @param access_token Access token
   * @experimental
   */
  async getDiscordUserIdFromAccessToken(token_type: 'Bot' | 'Bearer', access_token: string): Promise<string> {
    const tempRest = new REST({ version: '10' }).setToken(access_token);
    return (
      (await tempRest.get(Routes.user(), {
        authPrefix: token_type
      })) as RESTGetAPICurrentUserResult
    ).id;
  }

  async getTokens(code: string): Promise<RESTPostOAuth2AccessTokenResult> {
    const tokenUrl = 'https://discord.com/api/oauth2/token';
    const tokenData: RESTPostOAuth2AccessTokenURLEncodedData = {
      client_id: this.discordClientId,
      client_secret: this.discordClientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.discordCallbackUri
    };
    const tokenResponse = (
      await axios.post<RESTPostOAuth2AccessTokenResult>(tokenUrl, qs.stringify(tokenData), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      })
    ).data;
    return tokenResponse;
  }

  async refreshTokens(refresh_token: string): Promise<RESTPostOAuth2RefreshTokenResult> {
    const tokenUrl = 'https://discord.com/api/oauth2/token';
    const tokenData: RESTPostOAuth2RefreshTokenURLEncodedData = {
      grant_type: 'refresh_token',
      refresh_token,
      client_id: this.discordClientId,
      client_secret: this.discordClientSecret
    };
    const tokenResponse = (
      await axios.post<RESTPostOAuth2RefreshTokenResult>(tokenUrl, qs.stringify(tokenData), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      })
    ).data;
    return tokenResponse;
  }

  async tryKickUser(user: User): Promise<void> {
    try {
      await this.rest.delete(Routes.guildMember(this.discordGuildId, user.discord_id));
    } catch (e) {
      return;
    }
  }

  async joinUserToGuild(discordId: string, tokenResponse: RESTPostOAuth2AccessTokenResult, user: User): Promise<void> {
    await this.rest.put(Routes.guildMember(this.discordGuildId, discordId), {
      body: {
        access_token: tokenResponse.access_token,
        nick: this.utils.calculateNickname(user, 'dummy'),
        roles: this.utils.calculateRoles(user)
      } as RESTPutAPIGuildMemberJSONBody
    });
  }

  async fetchMember(discordId: string): Promise<void> {
    await this.rest.get(Routes.guildMember(this.discordGuildId, discordId));
  }

  async updateUser(discordUserId: string, userData: User, useCachedData = false): Promise<void> {
    const member = useCachedData
      ? this.cachedAllMembers.find((m) => m.user.id === discordUserId)
      : ((await this.rest.get(Routes.guildMember(this.discordGuildId, discordUserId))) as RESTGetAPIGuildMemberResult);
    if (member && member.roles.every((r) => r !== this.discordBotRole)) {
      const oldRoles = [...member.roles];
      const newRoles = member.roles
        .filter((r) => !this.discordManagedRoles.includes(r))
        .concat(this.utils.calculateRoles(userData));
      const toBeRemovedRoles = oldRoles.filter((r) => !newRoles.includes(r));
      const toBeAddedRoles = newRoles.filter((r) => !oldRoles.includes(r));
      for (const r of toBeAddedRoles) {
        await this.rest.put(Routes.guildMemberRole(this.discordGuildId, discordUserId, r));
      }
      for (const r of toBeRemovedRoles) {
        await this.rest.delete(Routes.guildMemberRole(this.discordGuildId, discordUserId, r));
      }
      const nickname = this.utils.calculateNickname(userData, member.user.username);
      if (member.nick !== nickname) {
        try {
          await this.rest.patch(Routes.guildMember(this.discordGuildId, discordUserId), {
            body: { nick: nickname } as RESTPatchAPIGuildMemberJSONBody
          });
        } catch (e) {
          Logger.log(`Cannot change nickname for ${discordUserId} from ${member.nick || ''} to ${nickname}`);
        }
      }
    }
    await this.updateMetadata(userData);
  }

  async updateMetadata(user: User): Promise<void> {
    const token = await this.utils.getDiscordAccessTokens(user);
    this.logger.log(token);
    const tempRest = new REST({ version: '10' }).setToken(token);
    const body: RESTPutAPICurrentUserApplicationRoleConnectionJSONBody = {
      platform_name: 'IVAO',
      platform_username: user.vid,
      metadata: this.utils.calculateMetadata(user)
    };
    await tempRest.put(Routes.userApplicationRoleConnection(this.discordClientId), { body });
  }

  async getAllMembersId(force = false): Promise<string[]> {
    return (await this.getAllMembers(force)).map((m) => m.user.id);
  }

  private async getAllMembers(force = false): Promise<RESTGetAPIGuildMembersResult> {
    if (force || this.cachedAllMembers.length === 0) {
      this.logger.log('Fetching all members of the guild');
      const query = new URLSearchParams();
      query.set('limit', '1000');
      const result: RESTGetAPIGuildMembersResult = [];
      let stop = false;
      let max = '0';
      do {
        query.set('after', max);
        const batch = (await this.rest.get(Routes.guildMembers(this.discordGuildId), {
          query
        })) as RESTGetAPIGuildMembersResult;
        if (batch.length === 0) {
          stop = true;
        } else {
          result.push(...batch);
          max = batch[batch.length - 1].user.id;
        }
      } while (!stop);
      this.cachedAllMembers = result;
    }
    return this.cachedAllMembers;
  }

  async isUserInGuild(discord_id: string): Promise<boolean> {
    try {
      await this.rest.get(Routes.guildMember(this.discordGuildId, discord_id));
      return true;
    } catch (e) {
      return false;
    }
  }
}
