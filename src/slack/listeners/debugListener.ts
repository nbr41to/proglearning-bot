import { App } from '@slack/bolt';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PROGLEARNING_API_BASE_URL = process.env.PROGLEARNING_API_BASE_URL ?? '';
const PROGLEARNING_API_KEY = process.env.PROGLEARNING_API_KEY ?? '';
const SLACK_TEST_CHANNEL_ID = process.env.SLACK_TEST_CHANNEL_ID ?? '';
const encodedApiKey = Buffer.from(PROGLEARNING_API_KEY).toString('base64');

export function debugListener(app: App): void {
  app.event('reaction_added', async ({ event, client, logger }) => {
    if (event.item.channel !== SLACK_TEST_CHANNEL_ID) return;
    const joinUserId = event.user;
    try {
      /* JoinしたUserのEmailを取得 */
      const result = await client.users.profile.get({
        user: joinUserId,
      });
      if (!result.profile) throw new Error('result.profile is undefined');
      console.log('result.profile', result.profile);

      const joinUserEmail = result.profile.email;
      const response = await axios.patch(
        PROGLEARNING_API_BASE_URL + '/update-slack-user-id',
        {
          slackUserId: joinUserId,
          email: joinUserEmail,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${encodedApiKey}`,
          },
        },
      );
      console.log('axios.patch', {
        slackUserId: joinUserId,
        email: joinUserEmail,
      });
      if (!response) throw new Error('update is failed');
    } catch (error) {
      logger.error(error);
      console.error(error);
    }
  });
}
