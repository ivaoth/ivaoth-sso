import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthState } from '../../entities/OAuthState.js';
import { User } from '../../entities/User.js';
import { DiscordApiService } from '../discord-api/discord-api.service.js';
import { DiscordToken } from '../../entities/DiscordToken.js';

@Controller('discord-oauth-callback')
export class DiscordOauthCallbackController {
  constructor(
    @InjectRepository(OAuthState)
    private oauthStateRepository: Repository<OAuthState>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private apiService: DiscordApiService,
    @InjectRepository(DiscordToken)
    private discordTokenRepository: Repository<DiscordToken>
  ) {}
  /**
   * (New verification flow) This is the URI Callback from Discord OAuth.
   * @param code The authorisation code from Discord.
   * @param state The state that we sent with OAuth request.
   */
  @Get()
  async discordCallback(@Query('code') code: string, @Query('state') state: string): Promise<string> {
    const oauthState = await this.oauthStateRepository.findOne({
      where: { state },
      relations: ['user']
    });

    if (oauthState) {
      const user = oauthState.user;
      const tokenResponse = await this.apiService.getTokens(code);

      const discordId = await this.apiService.getDiscordUserIdFromAccessToken(
        tokenResponse.token_type as 'Bot' | 'Bearer',
        tokenResponse.access_token
      );

      if (user.discord_id && user.discord_id !== discordId) {
        await this.apiService.tryKickUser(user);
      }

      user.discord_id = discordId;
      await this.userRepository.save(user);

      let discordToken = await this.discordTokenRepository.findOne({
        where: {
          user
        }
      });

      if (discordToken) {
        discordToken.access_token = tokenResponse.access_token;
        discordToken.refresh_token = tokenResponse.refresh_token;
        discordToken.expires_at = new Date(Date.now() + tokenResponse.expires_in * 1000);
      } else {
        discordToken = this.discordTokenRepository.create({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000),
          user
        });
      }

      await this.discordTokenRepository.save(discordToken);

      if (await this.apiService.isUserInGuild(discordId)) {
        await this.apiService.updateUser(discordId, user);
      } else {
        await this.apiService.updateMetadata(user);
        await this.apiService.joinUserToGuild(discordId, tokenResponse, user);
      }

      return 'Success';
    } else {
      return 'Invalid state';
    }
  }
}
