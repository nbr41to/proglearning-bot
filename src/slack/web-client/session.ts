import type { ChatPostMessageResponse } from '@slack/web-api';
import { slackClient } from './client';

const SLACK_LEARNING_CHANNEL_ID = process.env.SLACK_LEARNING_CHANNEL_ID ?? '';

/* LearningSessionの開始 */
export const sendStartSessionMessage = async (
  startedAt: string,
  username: string,
  isLearning: boolean,
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
        type: 'section',
        text: {
          type: 'plain_text',
          text: isLearning ? 'learning:' : 'mkmk(muted):',
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
export const updateSessionMembers = async (
  ts: string,
  startedAt: string,
  learningMemberNames: string[],
  mutedMemberNames: string[],
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
        type: 'section',
        text: {
          type: 'plain_text',
          text: 'learning:',
        },
      },
      {
        type: 'actions',
        elements:
          learningMemberNames.length > 0
            ? [
                ...learningMemberNames.map((name) => ({
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: name,
                  },
                })),
              ]
            : [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Empty',
                  },
                },
              ],
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: 'mkmk(muted):',
        },
      },
      {
        type: 'actions',
        elements:
          mutedMemberNames.length > 0
            ? [
                ...mutedMemberNames.map((name) => ({
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: name,
                  },
                })),
              ]
            : [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Empty',
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
    text: 'updated learning 👥',
  });

/* LearningSessionの終了 */
export const updateSessionMessage = async (
  ts: string,
  startedAt: string,
  learningMemberNames: string[],
  mutedMemberNames: string[],
  totalTimes: number,
): Promise<ChatPostMessageResponse> =>
  slackClient.chat.update({
    channel: SLACK_LEARNING_CHANNEL_ID,
    ts,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `【DONE】${totalTimes}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Discordの自習室は終了しました（${startedAt}〜）`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'plain_text',
            text: '[↓JOINED] お疲れさまでした✨',
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: 'learning:',
        },
      },
      {
        type: 'actions',
        elements:
          learningMemberNames.length > 0
            ? [
                ...learningMemberNames.map((name) => ({
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: name,
                  },
                })),
              ]
            : [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Empty',
                  },
                },
              ],
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: 'mkmk(muted):',
        },
      },
      {
        type: 'actions',
        elements:
          mutedMemberNames.length > 0
            ? [
                ...mutedMemberNames.map((name) => ({
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: name,
                  },
                })),
              ]
            : [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Empty',
                  },
                },
              ],
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: '自習室の開始はこちらから →',
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
    text: 'finish learning 🎉',
  });
