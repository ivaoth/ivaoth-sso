import { Body, Controller, Post, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { User } from '../../entities/User';
import { UtilitiesService } from '../utilities/utilities.service';

@Controller('submit-consent')
export class SubmitConsentController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private utilitiesService: UtilitiesService
  ) {}

  @Post()
  async submitConsent(
    @Body('consent') consent: string,
    @Body('_token') vid: string,
    @Res() res: Response
  ) {
    if (consent !== 'consent') {
      return;
    }

    const user = await this.userRepository.find({
      where: {
        vid
      }
    });

    await this.userRepository.update({ vid }, { consentTime: new Date() });

    res.redirect(await this.utilitiesService.getDiscordOauthUrl(user[0]));
  }
}
