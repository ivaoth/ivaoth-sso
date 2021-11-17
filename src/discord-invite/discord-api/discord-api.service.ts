import { REST } from '@discordjs/rest';
import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  RESTGetAPICurrentUserResult,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildMembersResult,
  RESTPatchAPIGuildMemberJSONBody,
  RESTPostOAuth2AccessTokenURLEncodedData,
  RESTPutAPIGuildMemberJSONBody,
  Routes
} from 'discord-api-types/v9';
import qs from 'qs';
import { User } from '../../entities/User';
import { TokenData } from '../../interfaces';
import { UtilitiesService } from '../utilities/utilities.service';

@Injectable()
export class DiscordApiService {
  private rest: REST;

  constructor(
    private utils: UtilitiesService,
    @Inject('DISCORD_CLIENT_ID') private discordClientId: string,
    @Inject('DISCORD_CLIENT_SECRET') private discordClientSecret: string,
    @Inject('DISCORD_CALLBACK_URI') private discordCallbackUri: string,
    @Inject('DISCORD_GUILD_ID') private discordGuildId: string,
    @Inject('DISCORD_BOT_TOKEN') discordBotToken: string,
    @Inject('DISCORD_BOT_ROLE') private discordBotRole: string,
    @Inject('DISCORD_MANAGED_ROLES') private discordManagedRoles: string[]
  ) {
    this.rest = new REST({ version: '9' }).setToken(discordBotToken);
  }

  /**
   * Get Discord User ID from an access token
   * @param token_type Token type
   * @param access_token Access token
   * @experimental
   */
  async getDiscordUserIdFromAccessToken(
    token_type: 'Bot' | 'Bearer',
    access_token: string
  ): Promise<string> {
    const tempRest = new REST({ version: '9' }).setToken(access_token);
    return (
      (await tempRest.get(Routes.user(), {
        authPrefix: token_type
      })) as RESTGetAPICurrentUserResult
    ).id;
  }

  async getTokens(code: string): Promise<TokenData> {
    const tokenUrl = 'https://discord.com/api/oauth2/token';
    const tokenData: RESTPostOAuth2AccessTokenURLEncodedData = {
      client_id: this.discordClientId,
      client_secret: this.discordClientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.discordCallbackUri
    };
    const tokenResponse = (
      await axios.post<TokenData>(tokenUrl, qs.stringify(tokenData), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      })
    ).data;
    return tokenResponse;
  }

  async tryKickUser(user: User): Promise<void> {
    try {
      await this.rest.delete(
        Routes.guildMember(this.discordGuildId, user.discord_id)
      );
    } catch (e) {
      return;
    }
  }

  async joinUserToGuild(
    discordId: string,
    tokenResponse: TokenData,
    user: User
  ): Promise<void> {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateUser(
    discordUserId: string,
    userData: User | null
  ): Promise<void> {
    const member = (await this.rest.get(
      Routes.guildMember(this.discordGuildId, discordUserId)
    )) as RESTGetAPIGuildMemberResult;
    if (member.roles.every((r) => r !== this.discordBotRole)) {
      const oldRoles = [...member.roles];
      const newRoles = member.roles
        .filter((r) => !this.discordManagedRoles.includes(r))
        .concat(this.utils.calculateRoles(userData));
      const toBeRemovedRoles = oldRoles.filter((r) => !newRoles.includes(r));
      const toBeAddedRoles = newRoles.filter((r) => !oldRoles.includes(r));
      for (const r of toBeAddedRoles) {
        await this.rest.put(
          Routes.guildMemberRole(this.discordGuildId, discordUserId, r)
        );
      }
      for (const r of toBeRemovedRoles) {
        await this.rest.delete(
          Routes.guildMemberRole(this.discordGuildId, discordUserId, r)
        );
      }
      const nickname = this.utils.calculateNickname(
        userData,
        member.user.username
      );
      if (member.nick !== nickname) {
        await this.rest.patch(
          Routes.guildMember(this.discordGuildId, discordUserId),
          {
            body: {
              nick: nickname
            } as RESTPatchAPIGuildMemberJSONBody
          }
        );
      }
    }
  }

  async getAllMembersId(): Promise<string[]> {
    const query = new URLSearchParams();
    query.set('limit', '1000');
    const result: string[] = [];
    let stop = false;
    let max = '0';
    do {
      query.set('after', max);
      const batch = (await this.rest.get(
        Routes.guildMembers(this.discordGuildId),
        {
          query
        }
      )) as RESTGetAPIGuildMembersResult;
      if (batch.length === 0) {
        stop = true;
      } else {
        result.push(...batch.map((m) => m.user.id));
        max = batch[batch.length - 1].user.id;
      }
    } while (!stop);
    return result;
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
