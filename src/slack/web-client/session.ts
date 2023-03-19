import type { ChatPostMessageResponse } from '@slack/web-api';
import { slackClient } from './client';

const SLACK_LEARNING_CHANNEL_ID = process.env.SLACK_LEARNING_CHANNEL_ID ?? '';

/* LearningSessionの開始 */
export const sendStartSessionMessage = async (
  startedAt: string,
  username: string,
): Promise<ChatPostMessageResponse> =>
  slackClient.chat.postMessage({
    channel: SLACK_LEARNING_CHANNEL_ID,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🎉 ${startedAt} 〜`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: '★Discordの自習室が公開中★',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: username,
            },
          },
        ],
      },

      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Clickして参加してみましょう 🥳 →',
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Discordの招待リンク',
          },
          url: 'https://discord.gg/JarxAYjm6C',
        },
      },
    ],
    text: 'Started learning 🎉',
  });

/* LearningSessionの更新 */
export const sendUpdateSessionMessage = async (
  ts: string,
  startedAt: string,
  usernames: any[],
): Promise<ChatPostMessageResponse> =>
  slackClient.chat.update({
    channel: SLACK_LEARNING_CHANNEL_ID,
    ts,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🎉 ${startedAt} 〜`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: '★Discordの自習室が公開中★',
        },
      },
      {
        type: 'actions',
        elements: [
          ...usernames.map((username) => ({
            type: 'button',
            text: {
              type: 'plain_text',
              text: username,
            },
          })),
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Clickして参加してみましょう 🥳 →',
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Discordの招待リンク',
          },
          url: 'https://discord.gg/JarxAYjm6C',
        },
      },
    ],
    text: 'updated learning 👥',
  });
