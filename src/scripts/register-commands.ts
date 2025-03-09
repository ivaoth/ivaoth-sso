import 'dotenv/config';

import { REST } from '@discordjs/rest';
import * as DiscordTypes from 'discord-api-types/v10';

const commands: DiscordTypes.RESTPutAPIApplicationGuildCommandsJSONBody = [
  {
    name: 'verify',
    description: 'Show IVAO user verification instructions',
    contexts: [DiscordTypes.InteractionContextType.Guild],
    type: DiscordTypes.ApplicationCommandType.ChatInput,
    options: []
  },
  {
    name: 'broadcast',
    description: 'Broadcast a message in specified channel',
    contexts: [DiscordTypes.InteractionContextType.Guild],
    type: DiscordTypes.ApplicationCommandType.ChatInput,
    options: [
      {
        type: DiscordTypes.ApplicationCommandOptionType.Channel,
        name: 'channel',
        description: 'Channel to send broadcast message in',
        channel_types: [DiscordTypes.ChannelType.GuildText, DiscordTypes.ChannelType.GuildAnnouncement],
        required: true
      }
    ]
  }
];

const applicationId = process.env['DISCORD_CLIENT_ID'];
const token = process.env['DISCORD_BOT_TOKEN'];
const guildId = process.env['DISCORD_GUILD_ID'];
if (applicationId && token && guildId) {
  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(DiscordTypes.Routes.applicationGuildCommands(applicationId, guildId), { body: commands });
}
