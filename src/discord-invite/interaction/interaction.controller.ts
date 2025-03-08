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
  MessageFlags
} from 'discord-api-types/v10';
import { Request as ExpressRequest } from 'express';
import libsodium from 'libsodium-wrappers';

@Controller('discord/interaction')
export class InteractionController {
  @Post()
  receiveInteraction(
    @Body() interaction: APIInteraction,
    @Request() request: RawBodyRequest<ExpressRequest>,
    @Headers('X-Signature-Ed25519') signature: string,
    @Headers('X-Signature-Timestamp') timestamp: string,
    @Inject('DISCORD_BOT_PUBLIC_KEY') publicKey: string
  ): APIInteractionResponse {
    if (
      libsodium.crypto_sign_verify_detached(
        Buffer.from(signature, 'utf8'),
        Buffer.concat([Buffer.from(timestamp, 'utf8'), request.rawBody || Buffer.from([])]),
        Buffer.from(publicKey, 'utf8')
      )
    ) {
      if (interaction.type === InteractionType.Ping) {
        return {
          type: InteractionResponseType.Pong
        };
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
}
