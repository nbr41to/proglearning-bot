import {
  sendStartSessionMessage,
  updateSessionMessage,
  updateSessionMembers,
} from '../../slack/web-client/session';
import {
  getLatestRoomSession,
  createRoomSession,
  deleteRoomSession,
  updateRoomSession,
} from '../../libs/roomSession';
import type { Client, VoiceChannel } from 'discord.js';
import { Events } from 'discord.js';
import dayjs from 'dayjs';

const learningChannelId = process.env.DISCORD_LEARNING_CHANNEL_ID ?? '';
const mutedChannelId = process.env.DISCORD_MUTED_CHANNEL_ID ?? '';

export const roomsListener = (client: Client): void => {
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
      console.log('初めての入室 通知を送る');
      const now = new Date();
      const nowFormatted = dayjs().format('YYYY/MM/DD HH:mm:ss');
      const joinMemberId = newState.member.id;

      const message = await sendStartSessionMessage(
        nowFormatted,
        newState.member.user.username,
        isJoinLearning,
      );
      // const message = { ts: '1679236214.601819' };

      await createRoomSession({
        slack_timestamp: message.ts || '',
        joined_learning_channel_member_ids: isJoinLearning
          ? [joinMemberId]
          : [],
        joined_muted_channel_member_ids: isJoinMuted ? [joinMemberId] : [],
        created_at: now,
        discord_learning_personal_sessions: [
          {
            discord_id: joinMemberId,
            joined_at: now,
          },
        ],
      });
    }

    /**
     * 各Channelのメンバーに変更があった場合
     */
    if ((isJoin && roomCount > 1) || (isLeave && roomCount !== 0)) {
      console.log('更新のタイミングです');
      const learningMembers = learningChannel.members;
      const mutedMembers = mutedChannel.members;

      const latestSession = await getLatestRoomSession();
      if (!latestSession) return;
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
      await updateRoomSession({
        slack_timestamp: latestSession.slack_timestamp,
        joined_learning_channel_member_ids: newLearningMembers,
        joined_muted_channel_member_ids: newMutedMembers,
      });
      await updateSessionMembers(
        latestSession.slack_timestamp,
        dayjs(latestSession.created_at).format('YYYY/MM/DD HH:mm:ss'),
        learningMembers.map((member) => member.user.username),
        mutedMembers.map((member) => member.user.username),
      );
    }

    /**
     * 各Channelの最後の1人が退室
     */
    if (isLeave && roomCount === 0) {
      console.log('最後の1人が退室しました');
      const session = await getLatestRoomSession();
      if (!session) return;
      await deleteRoomSession(session.slack_timestamp); // TODO: あとで消す

      const totalTimes = dayjs().diff(
        dayjs(session?.created_at),
        'minute',
        true,
      );

      await updateSessionMessage(
        session.slack_timestamp,
        dayjs(session?.created_at).format('YYYY/MM/DD HH:mm:ss'),
        session.joined_learning_channel_member_ids.map(
          (id) => client.users.cache.get(id)?.username || '',
        ),
        session.joined_muted_channel_member_ids.map(
          (id) => client.users.cache.get(id)?.username || '',
        ),
        totalTimes,
      );
    }
  });
};
