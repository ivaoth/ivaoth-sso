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
import {
  APIInteraction,
  InteractionType,
  InteractionResponseType,
  APIInteractionResponse,
  MessageFlags,
  ApplicationCommandType
} from 'discord-api-types/v10';
import { Request as ExpressRequest } from 'express';
import libsodium from 'libsodium-wrappers';
import { stripIndents } from 'common-tags';

@Controller('discord/interaction')
export class InteractionController {
  constructor(@Inject('DISCORD_BOT_PUBLIC_KEY') private publicKey: string) {}

  @Post()
  receiveInteraction(
    @Body() interaction: APIInteraction,
    @Request() request: RawBodyRequest<ExpressRequest>,
    @Headers('X-Signature-Ed25519') signature: string,
    @Headers('X-Signature-Timestamp') timestamp: string
  ): APIInteractionResponse {
    if (
      libsodium.crypto_sign_verify_detached(
        Buffer.from(signature, 'hex'),
        Buffer.concat([Buffer.from(timestamp, 'utf8'), request.rawBody || Buffer.from([])]),
        Buffer.from(this.publicKey, 'hex')
      )
    ) {
      if (interaction.type === InteractionType.Ping) {
        return {
          type: InteractionResponseType.Pong
        };
      } else if (interaction.type === InteractionType.ApplicationCommand) {
        if (interaction.data.type === ApplicationCommandType.ChatInput) {
          if (interaction.data.name === 'verify') {
            return this.handleVerifyCommand();
          }
        }
      }
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'UnhandledInteractionException',
          flags: MessageFlags.Ephemeral
        }
      };
    } else {
      throw UnauthorizedException;
    }
  }

  handleVerifyCommand(): APIInteractionResponse {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: stripIndents`
          กรุณาคลิกที่ link ด้านล่างนี้ เพื่อเชื่อมต่อ IVAO Account ของคุณ กับ Discord
      
          Please click the link below to link your VID with Discord.
      
          https://l.th.ivao.aero/discordInvite`
      }
    };
  }
}
