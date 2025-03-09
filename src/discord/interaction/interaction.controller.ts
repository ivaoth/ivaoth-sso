import {
  Body,
  Controller,
  Headers,
  Inject,
  Post,
  RawBodyRequest,
  Request,
  UnauthorizedException
} from '@nestjs/common';
import * as DiscordTypes from 'discord-api-types/v10';
import * as DiscordTypeUtils from 'discord-api-types/utils/v10';
import { Request as ExpressRequest } from 'express';
import libsodium from 'libsodium-wrappers';
import { stripIndents } from 'common-tags';
import { UtilitiesService } from '../utilities/utilities.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../../entities/Admin';
import { Repository } from 'typeorm';
import { DiscordApiService } from '../discord-api/discord-api.service';

@Controller('discord/interaction')
export class InteractionController {
  constructor(
    @Inject('DISCORD_BOT_PUBLIC_KEY') private publicKey: string,
    private utils: UtilitiesService,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    private discord: DiscordApiService
  ) {}

  @Post()
  async receiveInteraction(
    @Body() interaction: DiscordTypes.APIInteraction,
    @Request() request: RawBodyRequest<ExpressRequest>,
    @Headers('X-Signature-Ed25519') signature: string,
    @Headers('X-Signature-Timestamp') timestamp: string
  ): Promise<DiscordTypes.APIInteractionResponse> {
    if (
      libsodium.crypto_sign_verify_detached(
        Buffer.from(signature, 'hex'),
        Buffer.concat([Buffer.from(timestamp, 'utf8'), request.rawBody || Buffer.from([])]),
        Buffer.from(this.publicKey, 'hex')
      )
    ) {
      if (interaction.type === DiscordTypes.InteractionType.Ping) {
        return {
          type: DiscordTypes.InteractionResponseType.Pong
        };
      } else if (interaction.type === DiscordTypes.InteractionType.ApplicationCommand) {
        if (DiscordTypeUtils.isGuildInteraction(interaction)) {
          if (DiscordTypeUtils.isChatInputApplicationCommandInteraction(interaction)) {
            if (interaction.data.name === 'verify') {
              return this.handleVerifyCommand();
            } else if (interaction.data.name === 'broadcast') {
              return this.handleBroadcastCommand(interaction);
            }
          }
        }
      }
      return this.generateErrorTextInteractionResponse('Error: unhandled interaction');
    } else {
      throw UnauthorizedException;
    }
  }
  private handleVerifyCommand(): DiscordTypes.APIInteractionResponse {
    return {
      type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: stripIndents`
          กรุณาคลิกที่ link ด้านล่างนี้ เพื่อเชื่อมต่อ IVAO Account ของคุณ กับ Discord
      
          Please click the link below to link your VID with Discord.
      
          https://l.th.ivao.aero/discordInvite`
      }
    };
  }

  private async isAdmin(discord_id: string): Promise<boolean> {
    const admin = this.adminRepository.findOne({ where: { discord_id } });
    if (await admin) {
      return true;
    } else {
      return false;
    }
  }

  private async handleBroadcastCommand(
    interaction: DiscordTypes.APIChatInputApplicationCommandGuildInteraction
  ): Promise<DiscordTypes.APIInteractionResponse> {
    const user = interaction.member;
    if (await this.isAdmin(user.user.id)) {
      if (interaction.data.options) {
        const channel_id = interaction.data.options.find(
          (option): option is DiscordTypes.APIApplicationCommandInteractionDataChannelOption => {
            return option.type === DiscordTypes.ApplicationCommandOptionType.Channel && option.name === 'channel';
          }
        );
        if (channel_id) {
          return {
            type: DiscordTypes.InteractionResponseType.Modal,
            data: {
              title: 'Broadcast a message',
              custom_id: channel_id.value,
              components: [
                {
                  type: DiscordTypes.ComponentType.ActionRow,
                  components: [
                    {
                      type: DiscordTypes.ComponentType.TextInput,
                      style: DiscordTypes.TextInputStyle.Paragraph,
                      custom_id: 'message',
                      label: 'Announcement text',
                      required: true,
                      placeholder: 'Enter annoucement text here'
                    }
                  ]
                }
              ]
            }
          };
        }
      }
      return this.generateErrorTextInteractionResponse('Error: malformed interaction');
    }
    return this.generateErrorTextInteractionResponse('Error: you are not allow to execute this command');
  }

  private generateErrorTextInteractionResponse(message: string): DiscordTypes.APIInteractionResponse {
    return {
      type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: message,
        flags: DiscordTypes.MessageFlags.Ephemeral
      }
    };
  }
}
