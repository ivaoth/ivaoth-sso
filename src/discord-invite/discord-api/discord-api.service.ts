import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import qs from 'qs';
import { User } from '../../entities/User';
import { TokenData } from '../../interfaces';
import { UtilitiesService } from '../utilities/utilities.service';
import * as Discord from 'discord.js';

@Injectable()
export class DiscordApiService {
  private guild: Promise<Discord.Guild>;

  constructor(
    private utils: UtilitiesService,
    @Inject('DISCORD_CLIENT_ID') private discordClientId: string,
    @Inject('DISCORD_CLIENT_SECRET') private discordClientSecret: string,
    @Inject('DISCORD_CALLBACK_URI') private discordCallbackUri: string,
    @Inject('DISCORD_GUILD_ID') discordGuildId: string,
    @Inject('DISCORD_BOT_TOKEN') discordBotToken: string,
    @Inject('DISCORD_BOT_ROLE') private discordBotRole: string,
    @Inject('DISCORD_MANAGED_ROLES') private discordManagedRoles: string[]
  ) {
    const client = new Discord.Client();
    void client.login(discordBotToken);
    const clientReady = new Promise<void>((res) => {
      client.on('ready', () => {
        res();
      });
    });
    this.guild = clientReady.then(() => {
      return Promise.resolve(client.guilds.fetch(discordGuildId));
    });
  }

  /**
   * Get Discord User ID from an access token
   * @param token_type Token type
   * @param access_token Access token
   * @experimental
   */
  async getDiscordUserIdFromAccessToken(
    token_type: string,
    access_token: string
  ): Promise<string> {
    const tempClient = new Discord.Client({
      _tokenType: token_type
    } as Discord.ClientOptions);
    tempClient.token = access_token;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (
      await (
        tempClient as unknown as {
          api: { users: { '@me': { get: () => Promise<{ id: string }> } } };
        }
      ).api.users['@me'].get()
    ).id;
  }

  async getTokens(code: string): Promise<TokenData> {
    const tokenUrl = 'https://discord.com/api/oauth2/token';
    const tokenData = {
      client_id: this.discordClientId,
      client_secret: this.discordClientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.discordCallbackUri,
      scope: 'identify guilds.join'
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
    const member = this.fetchMemberFromUserId(user.discord_id);
    if (await member) {
      await (await member).kick();
    }
  }

  async joinUserToGuild(
    discordId: string,
    tokenResponse: TokenData,
    user: User
  ): Promise<void> {
    await (
      await this.guild
    ).addMember(discordId, {
      accessToken: tokenResponse.access_token,
      nick: this.utils.calculateNickname(user, 'dummy'),
      roles: this.utils.calculateRoles(user)
    });
  }

  async fetchMember(discordId: string): Promise<void> {
    await (await this.guild).members.fetch(discordId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateUser(
    discordUserId: string,
    userData: User | null
  ): Promise<void> {
    const member = (await this.guild).members.cache.get(discordUserId);
    if (member.roles.cache.every((r) => r.id !== this.discordBotRole)) {
      const oldRoles = member.roles.cache.map((r) => r.id);
      const newRoles = member.roles.cache
        .filter((r) => !this.discordManagedRoles.includes(r.id))
        .map((r) => r.id)
        .concat(this.utils.calculateRoles(userData));
      if (
        oldRoles.filter((r) => !newRoles.includes(r)).length > 0 ||
        newRoles.filter((r) => !oldRoles.includes(r)).length > 0
      ) {
        await member.roles.set(newRoles);
      }
      const nickname = this.utils.calculateNickname(
        userData,
        member.user.username
      );
      if (member.nickname !== nickname) {
        await member.setNickname(nickname);
      }
    }
  }

  async getAllMembersId(): Promise<string[]> {
    return (await (await this.guild).members.fetch()).map((m) => m.user.id);
  }

  async isUserInGuild(discord_id: string): Promise<boolean> {
    if (await this.fetchMemberFromUserId(discord_id)) {
      return true;
    } else {
      return false;
    }
  }

  private async fetchMemberFromUserId(
    discord_id: string
  ): Promise<Discord.GuildMember | null> {
    return (await this.guild).members
      .fetch(discord_id)
      .catch(() => null as null);
  }
}
