import { App, ExpressReceiver } from '@slack/bolt';
import { helloListener } from './listeners/hello';
import { askBotListener } from './listeners/askBot';
import { indexHandler } from './handlers';

import dotenv from 'dotenv';

dotenv.config();

/* Environments */
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

const express = new ExpressReceiver({
  signingSecret: SLACK_SIGNING_SECRET ?? '',
});
const router = express.router;

export const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
  receiver: express,
});

/* Slack listeners */
helloListener(app);
askBotListener(app);

/* API */
indexHandler(router);
