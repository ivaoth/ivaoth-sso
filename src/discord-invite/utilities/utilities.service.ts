import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { titleCase } from 'title-case';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OAuthState } from '../../entities/OAuthState.js';
import { User } from '../../entities/User.js';

@Injectable()
export class UtilitiesService {
  constructor(
    @Inject('DISCORD_THIS_DIVISION_ROLE')
    private discordThisDivisionRole: string,
    @Inject('DISCORD_OTHER_DIVISION_ROLE')
    private discordOtherDivisionRole: string,
    @Inject('DISCORD_THIS_DIVISION_STAFF_ROLE')
    private discordThisDivisionStaffRole: string,
    @Inject('DISCORD_OTHER_DIVISION_STAFF_ROLE')
    private discordOtherDivisionStaffRole: string,
    @Inject('DISCORD_HQ_STAFF_ROLE') private discordHQStaffRole: string,
    @Inject('DISCORD_VERIFIED_USER_ROLE')
    private discordVerifiedUserRole: string,
    @Inject('DISCORD_UNVERIFIED_USER_ROLE')
    private discordUnverifiedUserRole: string,
    @Inject('DISCORD_UNCONSENTED_ROLE')
    private discordUnconsentedRole: string,
    @Inject('THIS_DIVISION') private thisDivision: string,
    @Inject('THIS_DIVISION_FIRS') private thisDivisionFirs: string[],
    @InjectRepository(OAuthState)
    private oauthStateRepository: Repository<OAuthState>,
    @Inject('DISCORD_CLIENT_ID') private discordClientId: string,
    @Inject('DISCORD_CALLBACK_URI') private discordCallbackUri: string
  ) {}

  calculateRoles(user: User | null): string[] {
    if (user) {
      if (user.consentTime) {
        const roles = new Set<string>();
        roles.add(this.discordVerifiedUserRole);
        if (user.division === this.thisDivision) {
          roles.add(this.discordThisDivisionRole);
        } else {
          roles.add(this.discordOtherDivisionRole);
        }
        if (user.staff) {
          const positions = user.staff.split(':').map((s) => s.trim());
          for (const position of positions) {
            if (position.includes('-')) {
              const firstPart = position.split('-')[0];
              if (firstPart === this.thisDivision || this.thisDivisionFirs.includes(firstPart)) {
                roles.add(this.discordThisDivisionStaffRole);
              } else {
                roles.add(this.discordOtherDivisionStaffRole);
              }
            } else {
              roles.add(this.discordHQStaffRole);
            }
          }
        }
        return Array.from<string>(roles);
      } else {
        return [this.discordUnconsentedRole];
      }
    } else {
      return [this.discordUnverifiedUserRole];
    }
  }

  calculateNickname(user: User | null, discordUsername: string): string {
    if (user) {
      if (user.consentTime) {
        const eligiblePositions = user.staff
          ? user.staff
              .split(':')
              .map((s) => s.trim())
              .filter((s) => {
                return s.includes('-');
              })
              .filter((s) => {
                const firstPart = s.split('-')[0];
                return firstPart === this.thisDivision || this.thisDivisionFirs.includes(firstPart);
              })
          : [];
        const prefix = eligiblePositions.length > 0 ? `${eligiblePositions.join('/')} ` : `${user.vid} `;

        const suffix = user.division === this.thisDivision ? '' : ` - ${user.division}`;

        const baseName = (user.customNickname ? user.customNickname : titleCase(user.firstname)).substring(
          0,
          32 - prefix.length - suffix.length
        );
        return prefix + baseName + suffix;
      } else {
        return `[UNCONSENTED] ${discordUsername}`.substring(0, 32);
      }
    } else {
      return `[UNVERIFIED] ${discordUsername}`.substring(0, 32);
    }
  }

  async getDiscordOauthUrl(user: User) {
    const key = uuidv4();

    const state = this.oauthStateRepository.create({ state: key, user });
    await this.oauthStateRepository.save(state);

    const authorizeUrl = new URL('https://discord.com/api/oauth2/authorize');
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('client_id', this.discordClientId);
    authorizeUrl.searchParams.set('scope', 'identify guilds.join role_connections.write');
    authorizeUrl.searchParams.set('redirect_uri', this.discordCallbackUri);
    authorizeUrl.searchParams.set('state', key);
    return authorizeUrl.href;
  }
}
