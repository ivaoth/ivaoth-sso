import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/User';
import { DiscordApiService } from '../discord-api/discord-api.service';

@Controller('update-member')
export class UpdateMemberController {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private discordApiService: DiscordApiService
  ) {}

  @Post()
  async updateMember(@Body('discord_user_id') discordUserId: string): Promise<void> {
    await this.discordApiService.fetchMember(discordUserId);
    const user = await this.userRepository.findOne({
      where: { discord_id: discordUserId }
    });
    await this.discordApiService.updateUser(discordUserId, user);
  }

  @Post('all')
  async updateAllMembers(): Promise<void> {
    const membersId = await this.discordApiService.getAllMembersId(true);
    await Promise.all(
      membersId.map(async (member) => {
        const userData = await this.userRepository.findOne({
          where: { discord_id: member }
        });
        await this.discordApiService.updateUser(member, userData, true);
      })
    );
  }
}
