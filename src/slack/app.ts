import { App } from '@slack/bolt';
import { helloHandler } from './handlers/hello';
import dotenv from 'dotenv';
import { askBotHandler } from './handlers/askBot';
dotenv.config();

/* Environments */
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

export const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
});

helloHandler(app);
askBotHandler(app);
