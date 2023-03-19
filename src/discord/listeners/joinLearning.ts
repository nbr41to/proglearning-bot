import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import dayjs from 'dayjs';

const DISCORD_LEARNING_CHANNEL_ID = process.env.DISCORD_LEARNING_CHANNEL_ID;
const SLACK_LEARNING_CHANNEL_ID = process.env.SLACK_LEARNING_CHANNEL_ID;

export const joinLearningListener = (client: Client): void => {
  /* ボイスチャンネルのイベントを検知 */
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    const isStarting =
      newChannel &&
      newChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
      newChannel.members.size === 1;
    const isUpdating =
      (newChannel &&
        newChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
        newChannel.members.size > 1) ||
      (oldChannel &&
        oldChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
        oldChannel.members.size > 0);
    const isFinishing =
      oldChannel &&
      oldChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
      oldChannel.members.size === 0;

    /* 人数が変化していない場合 */
    if (oldChannel === newChannel) return;

    /* 最初の一人を検知 */
    if (isStarting) {
      try {
        const nowJp = dayjs.tz().format('YYYY/MM/DD HH:mm:ss');

        /* Slackへの通知 */
        const response = await slack.chat.postMessage({
          channel: SLACK_LEARNING_CHANNEL_ID,
          blocks: startedBlocks(nowJp, newState.member.user.username),
          text: 'Started learning 🎉',
        });

        /* ルームの作成 */
        await createSession({
          slack_timestamp: response.ts,
          joined_member_ids: [newState.member.user.id],
        });
      } catch (error) {
        console.error(error);
      }
    }

    /* 人の出入りを検知 */
    if (isUpdating) {
      try {
        /* 最新のSessionのtsを取得 */
        const session = await getLatestSession();
        if (!session) return;
        const ts = session.slack_timestamp;
        const startedAtFormatted = dayjs
          .utc(session.created_at)
          .add(9, 'hour')
          .format('YYYY/MM/DD HH:mm:ss');
        const isJoining = newChannel?.id === DISCORD_LEARNING_CHANNEL_ID;
        const members = isJoining
          ? newChannel.members.map((member) => member.user.username)
          : oldChannel.members.map((member) => member.user.username);

        /* Slackの投稿を更新 */
        await slack.chat.update({
          channel: SLACK_LEARNING_CHANNEL_ID,
          ts,
          blocks: updatedBlocks(startedAtFormatted, members),
          text: 'updated learning 👥',
        });

        /* 新しいmemberが増えた時のみSessionを更新 */
        if (!isJoining) return;
        const currentMemberIds = session.joined_member_ids;
        const newMemberId = newState.member.user.id;
        if (currentMemberIds.includes(newState.member.user.id)) return;
        await updateSession(ts, {
          joined_member_ids: [...currentMemberIds, newMemberId],
        });
      } catch (error) {
        console.error(error);
      }
    }

    /* 最後の一人を検知 */
    if (isFinishing) {
      /* 最新のSessionのtsを取得 */
      const session = await getLatestSession();
      if (!session) return;
      const ts = session.slack_timestamp;
      const startedAtUTC = dayjs.utc(session.created_at);
      const startedAtFormatted = startedAtUTC
        .add(9, 'hour')
        .format('YYYY/MM/DD HH:mm:ss');
      /* 開催時間 */
      const hour = dayjs.utc().diff(startedAtUTC, 'hour');
      const minute = dayjs.utc().diff(startedAtUTC, 'minute') % 60;
      const second = dayjs.utc().diff(startedAtUTC, 'second') % 60;
      const totalTimes =
        hour > 0
          ? `${hour}時間${minute}分${second}秒`
          : `${minute}分${second}秒`;

      const joinedMembers = session.joined_member_ids.map(
        (id) => discord.users.cache.get(id)?.username,
      );

      /* Slackの投稿を更新 */
      await slack.chat.update({
        channel: SLACK_LEARNING_CHANNEL_ID,
        ts,
        blocks: finishedBlocks(startedAtFormatted, joinedMembers, totalTimes),
        text: 'Finished learning ✨',
      });

      /* Sessionの削除 */
      await deleteSession(ts);
    }
  });
};
