import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/Admin';
import { User } from './entities/User';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>
  ) {}

  @Get('getUser')
  async getUser(@Query('discord_id') discord_id: string): Promise<{ success: false } | { success: true; user: User }> {
    const user = await this.userRepo.findOne({ where: { discord_id } });
    if (user) {
      return { success: true, user };
    } else {
      return { success: false };
    }
  }

  /**
   * (General) Get all users in the database.
   */
  @Get('allUsers')
  async getAllUsers(): Promise<string[]> {
    const users = this.userRepo.find({});
    return (await users).map((u) => u.discord_id);
  }

  /**
   * (General) This endpoint checks if the user is allowed to perform administrative actions.
   * @param discord_id The Discord user
   */
  @Get('isAdmin')
  async isAdmin(@Query('discord_id') discord_id: string): Promise<{ isAdmin: boolean }> {
    const admin = this.adminRepo.findOne({ where: { discord_id } });
    if (await admin) {
      return { isAdmin: true };
    } else {
      return { isAdmin: false };
    }
  }

  /**
   * It's ping! I wonder what this do?
   * @returns pong
   */
  @Get('ping')
  ping() {
    return `pong at ${new Date().toString()}`;
  }
}
