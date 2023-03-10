import { App } from '@slack/bolt';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PROGLEARNING_API_BASE_URL = process.env.PROGLEARNING_API_BASE_URL ?? '';
const PROGLEARNING_API_KEY = process.env.PROGLEARNING_API_KEY ?? '';
const encodedApiKey = Buffer.from(PROGLEARNING_API_KEY).toString('base64');

export function joinTeamListener(app: App): void {
  app.event('team_join', async ({ event, client, logger }) => {
    const joinUserId = event.user.id;
    try {
      /* JoinしたUserのEmailを取得 */
      const result = await client.users.profile.get({
        user: joinUserId,
      });
      if (!result.profile) throw new Error('result.profile is undefined');

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
      if (!response) throw new Error('update is failed');
    } catch (error) {
      logger.error(error);
    }
  });
}
