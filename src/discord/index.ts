import {Client, Events, GatewayIntentBits} from 'discord.js';
import {roomSessionListener} from './listeners/roomSessionListener';
import {autoMutedListener} from './listeners/autoMutedListener';
import {personalSessionListener} from 'src/discord/listeners/personalSessionListener';
import {hayaokiSessionListener} from './listeners/hayaokiSessionListener';

/* Environments */
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? '';
const mutedChannelId1 = process.env.DISCORD_MUTED_CHANNEL_ID ?? '';
const mutedChannelId2 = process.env.DISCORD_HAYAOKI_7_CHANNEL_ID ?? '';

const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

/* listeners */
autoMutedListener(discord, [mutedChannelId1, mutedChannelId2]);
roomSessionListener(discord);
personalSessionListener(discord);
// hayaokiSessionListener(discord);

export const startDiscordApp = async () => {
  discord.once(Events.ClientReady, (client: Client<true>) => {
    console.log(`Ready! Discord logged in as ${client.user.tag}`);
  });

  discord.login(DISCORD_BOT_TOKEN);
};
