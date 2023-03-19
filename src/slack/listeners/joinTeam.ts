import { App } from '@slack/bolt';
import axios from 'axios';

const encodedApiKey = Buffer.from(
  process.env.PROGLEARNING_API_KEY ?? '',
).toString('base64');

export function joinTeamListener(app: App): void {
  app.event('team_join', async ({ event, client, logger }) => {
    console.log('team_join');
    const joinUserId = event.user.id;
    try {
      /* JoinしたUserのEmailを取得 */
      const result = await client.users.profile.get({
        user: joinUserId,
      });
      if (!result.profile) throw new Error('result.profile is undefined');
      console.log('result.profile', result.profile);

      const joinUserEmail = result.profile.email;
      const response = await axios.patch(
        process.env.PROGLEARNING_API_BASE_URL + '/update-slack-user-id',
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
    }
  });
}
