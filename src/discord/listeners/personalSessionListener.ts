import type { Client } from 'discord.js';

import { Events } from 'discord.js';
import {
  createPersonalSession,
  getLatestPersonalSession,
  updatePersonalSession,
} from 'src/libs/personalSession';

const learningChannelId = process.env.DISCORD_LEARNING_CHANNEL_ID ?? '';
const mutedChannelId = process.env.DISCORD_MUTED_CHANNEL_ID ?? '';

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
      console.log('入室 PersonalSessionの開始');

      await createPersonalSession({
        discord_id: newState.member.id,
        joined_at: new Date(),
      });
    }

    /**
     * 退室
     */
    if (isLeave && !isMove) {
      console.log('退室 PersonalSessionの終了');
      const session = await getLatestPersonalSession();
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
