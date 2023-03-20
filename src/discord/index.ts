import { Client, Events, GatewayIntentBits } from 'discord.js';
import { roomsListener } from './listeners/roomsListener';
import { autoMutedListener } from './listeners/autoMutedListener';

/* Environments */
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? '';

const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

/* listeners */
autoMutedListener(discord);
roomsListener(discord);

export const startDiscordApp = async () => {
  discord.once(Events.ClientReady, (client: Client<true>) => {
    console.log(`Ready! Discord logged in as ${client.user.tag}`);
  });

  discord.login(DISCORD_BOT_TOKEN);
};
