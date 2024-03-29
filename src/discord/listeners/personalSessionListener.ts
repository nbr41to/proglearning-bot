import type {Client} from 'discord.js';

import {Events} from 'discord.js';
import {
  createPersonalSession,
  getLatestPersonalSession,
  updatePersonalSession,
} from 'src/libs/personalSession';

const learningChannelId = process.env.DISCORD_LEARNING_CHANNEL_ID ?? '';
const mutedChannelId = process.env.DISCORD_MUTED_CHANNEL_ID ?? '';

/**
 * 個人のSessionの状態を監視してDBに保存する役割
 */
export const personalSessionListener = (client: Client): void => {
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

    /**
     * 入室
     */
    if (isJoin && !isMove) {
      if (!newState.member) return;
      const memberId = newState.member.id;
      console.info(`${memberId}の入室 PersonalSessionの開始`);

      await createPersonalSession({
        discord_id: memberId,
        joined_at: new Date(),
      });
    }

    /**
     * 退室
     */
    if (isLeave && !isMove) {
      if (!newState.member) return;
      const memberId = newState.member.id;
      console.info(`${memberId}の退室 PersonalSessionの終了`);

      const session = await getLatestPersonalSession(memberId);
      if (!session) return;

      const totalMs =
        new Date().getTime() - new Date(session.joined_at).getTime();

      await updatePersonalSession({
        id: session.id,
        left_at: new Date(),
        total_ms: totalMs,
      });
    }
  });
};
