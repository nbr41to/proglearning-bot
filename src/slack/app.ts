import { App, ExpressReceiver } from '@slack/bolt';
import { helloListener } from './listeners/hello';
import { askBotListener } from './listeners/askBot';
import { indexHandler } from './handlers';
import { joinTeamListener } from './listeners/joinTeam';

const express = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET ?? '',
});
const router = express.router;

export const app = new App({
  token: process.env.SLACK_BOT_TOKEN ?? '',
  signingSecret: process.env.SLACK_SIGNING_SECRET ?? '',
  receiver: express,
});

/* Slack listeners */
helloListener(app);
askBotListener(app);
joinTeamListener(app);

// debugListener(app);

/* API */
indexHandler(router);
