import type {Client} from 'discord.js';

import {Events} from 'discord.js';
import {
  brokeCommitPixelaGraph,
  completeCommitPixelaGraph,
  initialCommitPixelaGraph,
} from 'src/libs/hayaokiCommit';

const hayaoki7ChannelId = process.env.DISCORD_HAYAOKI_7_CHANNEL_ID ?? '';
const hayaokiBreakChannelId =
  process.env.DISCORD_HAYAOKI_BREAK_CHANNEL_ID ?? '';

/**
 * 早起きに関するPixelaのCommitをする
 */
export const hayaokiSessionListener = (client: Client): void => {
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const oldChannelId = oldState.channel?.id || null;
    const newChannelId = newState.channel?.id || null;

    /* Channelを移動していない */
    if (oldChannelId === newChannelId) return;

    /* 各Channelへの出入り入退室フラグ */
    const isJoin = newChannelId === hayaoki7ChannelId;
    const isLeave = oldChannelId === hayaoki7ChannelId;
    const leaveBreakChannel = oldChannelId === hayaokiBreakChannelId;

    /**
     * 早起き部屋入室
     */
    if (isJoin) {
      if (!newState.member) return;
      const memberId = newState.member.id;
      console.info(`${memberId}の朝活開始`);
      await initialCommitPixelaGraph(memberId);
    }

    /**
     * 早起き部屋退室
     */
    if (isLeave) {
      if (!newState.member) return;
      const memberId = newState.member.id;
      console.info(`${memberId}の朝活終了`);

      await completeCommitPixelaGraph(memberId);
    }

    /**
     * 休憩室を退室
     */
    if (leaveBreakChannel) {
      if (!newState.member) return;
      const memberId = newState.member.id;
      console.info(`${memberId}は朝活の休憩を達成した`);

      await brokeCommitPixelaGraph(memberId);
    }
  });
};
