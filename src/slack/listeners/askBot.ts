import { App } from '@slack/bolt';
import { postChat } from '../../libs/chatGpt';

const botUserId = process.env.SLACK_BOT_USER_ID ?? '';
const askBotChannelId = process.env.SLACK_ASK_BOT_CHANNEL_ID ?? '';

export function askBotListener(app: App): void {
  app.event('app_mention', async ({ event, client, say }) => {
    const channelId = event.channel;
    if (channelId !== askBotChannelId) return;
    try {
      /* 応答があったスレッドの内容を取得 */
      const replies = await client.conversations.replies({
        channel: channelId,
        ts: event.thread_ts || event.ts,
      });

      if (!replies.messages) {
        await say(
          '[ERROR]:\nスレッドが見つかりませんでした。\n管理者に連絡してください。',
        );

        return;
      }

      /* スレッドの内容をGTPに送信 */
      const threadMessages = replies.messages.map((message) => {
        return {
          role: message.user === botUserId ? 'assistant' : 'user',
          content: (message.text || '').replace(`<@${botUserId}>`, ''),
        };
      });
      const gptAnswerText = await postChat(threadMessages);

      /* スレッドに返信 */
      await say({
        text: gptAnswerText,
        thread_ts: event.ts,
      });
    } catch (error) {
      console.error(error);
    }
  });
}
