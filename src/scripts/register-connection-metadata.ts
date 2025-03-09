import 'dotenv/config';

import { REST } from '@discordjs/rest';
import {
  ApplicationRoleConnectionMetadataType,
  Routes,
  RESTPutAPIApplicationRoleConnectionMetadataJSONBody
} from 'discord-api-types/v10';

const metadata: RESTPutAPIApplicationRoleConnectionMetadataJSONBody = [
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    key: 'is_this_division',
    name: 'This Division',
    description: 'User is a user of this division'
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    key: 'is_this_division_staff',
    name: 'This Division Staff',
    description: 'User is a staff of this division'
  }
];

const applicationId = process.env['DISCORD_CLIENT_ID'];
const token = process.env['DISCORD_BOT_TOKEN'];
if (applicationId && token) {
  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(Routes.applicationRoleConnectionMetadata(applicationId), {
    body: metadata
  });
}
