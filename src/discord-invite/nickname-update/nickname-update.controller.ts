import { Body, Controller, Patch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/User';
import { DiscordApiService } from '../discord-api/discord-api.service';

@Controller('setNickname')
export class NicknameUpdateController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private discordApiService: DiscordApiService
  ) { }

  /**
   * (General) This update user's nickname in the server and trigger the bot to update the name.
   * @param discord_id The Discord user
   * @param nickname New nickname
   */
  @Patch()
  async setNickname(
    @Body('discord_id') discord_id: string,
    @Body('nickname') nickname: string
  ): Promise<{ success: boolean }> {
    const user = this.userRepo.findOne({ where: { discord_id } });
    (await user).customNickname = nickname;
    void this.userRepo.save(await user);
    await this.discordApiService.updateUser(discord_id, await user);
    return {
      success: true
    };
  }
}
