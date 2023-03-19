require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { WebClient } = require('@slack/web-api');
const dayjs = require('dayjs');
const {
  startedBlocks,
  updatedBlocks,
  finishedBlocks,
} = require('./src/slackSendBlock.js');
const {
  getLatestSession,
  createSession,
  updateSession,
  deleteSession,
} = require('./src/sessions.js');
const express = require('express');

dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.tz.setDefault('Asia/Tokyo');

/* Environments */
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_LEARNING_CHANNEL_ID = process.env.DISCORD_LEARNING_CHANNEL_ID;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_LEARNING_CHANNEL_ID = process.env.SLACK_LEARNING_CHANNEL_ID;

const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const slack = new WebClient(SLACK_BOT_TOKEN);

discord.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

discord.login(DISCORD_BOT_TOKEN);

/* Health check */
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
