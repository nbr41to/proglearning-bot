import {
  sendStartSessionMessage,
  updateSessionMessage,
  updateSessionMembers,
} from 'src/slack/web-client/session';
import {
  getLatestRoomSession,
  createRoomSession,
  deleteRoomSessions,
  updateRoomSession,
} from 'src/libs/roomSession';
import type { Client, VoiceChannel } from 'discord.js';
import { Events } from 'discord.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

const learningChannelId = process.env.DISCORD_LEARNING_CHANNEL_ID ?? '';
const mutedChannelId = process.env.DISCORD_MUTED_CHANNEL_ID ?? '';

export const roomSessionListener = (client: Client): void => {
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const oldChannelId = oldState.channel?.id || null;
    const newChannelId = newState.channel?.id || null;

    /* Channelを移動していない */
    if (oldChannelId === newChannelId) return;

    /* 各Channelへの出入り入退室フラグ */
    const isJoinLearning = newChannelId === learningChannelId;
    const isLeaveLearning = oldChannelId === learningChannelId;
    const isJoinMuted = newChannelId === mutedChannelId;
    const isLeaveMuted = oldChannelId === mutedChannelId;
    const isJoin = isJoinLearning || isJoinMuted;
    const isLeave = isLeaveLearning || isLeaveMuted;
    const isMove = isJoin && isLeave;

    /* 各Channelの状態を取得 */
    const [learningChannel, mutedChannel] = (await Promise.all([
      await client.channels.fetch(learningChannelId),
      await client.channels.fetch(mutedChannelId),
    ])) as [VoiceChannel, VoiceChannel];

    /* 各Channelの合計人数 */
    const roomCount = learningChannel.members.size + mutedChannel.members.size;

    /**
     * 各Channelに1人目が入室
     */
    if (roomCount === 1 && isJoin && !isMove) {
      if (!newState.member) return;
      /* 入室したらミュートになるように */
      const now = new Date();
      const nowFormatted = dayjs().tz().format('YYYY/MM/DD HH:mm');
      const joinMemberId = newState.member.id;

      /* Slackに投稿 */
      const message = await sendStartSessionMessage({
        startedAt: nowFormatted,
        memberName: newState.member.user.username,
        isLearning: isJoinLearning,
      });

      /* RoomSessionの作成 */
      await createRoomSession({
        slack_timestamp: message.ts || '',
        joined_learning_channel_member_ids: isJoinLearning
          ? [joinMemberId]
          : [],
        joined_muted_channel_member_ids: isJoinMuted ? [joinMemberId] : [],
        created_at: now,
      });
    }

    /**
     * 各Channelのメンバーに変更があった場合
     */
    if ((isJoin && roomCount > 1) || (isLeave && roomCount !== 0)) {
      const learningMembers = learningChannel.members;
      const mutedMembers = mutedChannel.members;

      /* 最新のSessionの取得 */
      const latestSession = await getLatestRoomSession();
      if (!latestSession) return;

      /* 重複を除く新しいmembers */
      const newLearningMembers = [
        ...new Set([
          ...learningMembers.map((member) => member.id),
          ...latestSession.joined_learning_channel_member_ids,
        ]),
      ];
      const newMutedMembers = [
        ...new Set([
          ...mutedMembers.map((member) => member.id),
          ...latestSession.joined_muted_channel_member_ids,
        ]),
      ];

      await Promise.all([
        /* Session情報の更新 */
        await updateRoomSession({
          slack_timestamp: latestSession.slack_timestamp,
          joined_learning_channel_member_ids: newLearningMembers,
          joined_muted_channel_member_ids: newMutedMembers,
        }),
        /* Slackの投稿の更新 */
        await updateSessionMembers({
          ts: latestSession.slack_timestamp,
          startedAt: dayjs(latestSession.created_at)
            .tz()
            .format('YYYY/MM/DD HH:mm'),
          learningMemberNames: learningMembers.map(
            (member) => member.user.username,
          ),
          mutedMemberNames: mutedMembers.map((member) => member.user.username),
        }),
      ]);
    }

    /**
     * 各Channelの最後の1人が退室
     */
    if (isLeave && roomCount === 0) {
      const session = await getLatestRoomSession();
      if (!session) return;

      const startedAt = session.created_at;
      const startedAtFormatted = dayjs(startedAt)
        .tz()
        .format('YYYY/MM/DD HH:mm');
      const finishedAtFormatted = dayjs().tz().format('YYYY/MM/DD HH:mm');
      /* 開催時間 */
      const hour = dayjs().diff(startedAt, 'hour');
      const minute = dayjs().diff(startedAt, 'minute') % 60;
      const second = dayjs().diff(startedAt, 'second') % 60;
      const totalTimes =
        hour > 0
          ? `${hour}時間${minute}分${second}秒`
          : `${minute}分${second}秒`;

      await updateSessionMessage({
        ts: session.slack_timestamp,
        startedAt: startedAtFormatted,
        finishedAt: finishedAtFormatted,
        learningMemberNames: session.joined_learning_channel_member_ids.map(
          (id) => client.users.cache.get(id)?.username || '',
        ),
        mutedMemberNames: session.joined_muted_channel_member_ids.map(
          (id) => client.users.cache.get(id)?.username || '',
        ),
        totalTimes,
      });

      await deleteRoomSessions();
    }
  });
};
