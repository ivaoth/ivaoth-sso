import { Controller, Get, Query, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { OAuthState } from '../../entities/OAuthState';
import { User } from '../../entities/User';
import { UserData } from '../../interfaces';
import { UtilitiesService } from '../utilities/utilities.service';

@Controller('discord-invite')
export class IvaoLoginController {
  constructor(
    @InjectRepository(OAuthState)
    private oauthStateRepository: Repository<OAuthState>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private utilitiesService: UtilitiesService
  ) {}

  /**
   * (New verification flow) This endpoint will redirect the user to the Discord OAuth page.
   * @param ivaoToken The token from IVAO Login API
   */
  @Get()
  async discordInvite(
    @Query('IVAOTOKEN') ivaoToken: string,
    @Res() res: Response
  ): Promise<void> {
    if (ivaoToken === 'error') {
      res.redirect(302, 'https://ivao.aero');
    } else {
      const ivaoApi = `https://login.ivao.aero/api.php?type=json&token=${ivaoToken}`;
      const userData = (await axios.get<UserData>(ivaoApi)).data;
      let user = await this.userRepository.findOne({
        where: {
          vid: userData.vid
        }
      });

      if (!user) {
        user = this.userRepository.create({
          ...userData,
          discord_id: ''
        });
      } else {
        user = this.userRepository.merge(user, { ...userData });
      }
      await this.userRepository.save(user);

      if (user.consentTime) {
        res.redirect(await this.utilitiesService.getDiscordOauthUrl(user));
      } else {
        res.render('consent', {
          vid: user.vid
        });
      }
    }
  }
}
