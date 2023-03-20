import { Client, Events, VoiceState } from 'discord.js';

export const autoMutedListener = (client: Client): void => {
  client.on(
    Events.VoiceStateUpdate,
    async (oldState: VoiceState, newState: VoiceState) => {
      if (oldState.channel?.id === newState.channel?.id) return;
      try {
        const mutedChannelId = process.env.DISCORD_MUTED_CHANNEL_ID ?? '';
        const isJoinMuted = newState.channel?.id === mutedChannelId;

        /* mutedに入ったらミュート */
        if (!newState.mute && isJoinMuted) {
          await newState.member?.voice.setMute(true);
        }

        /* mutedじゃない部屋に入った場合にミュートを解除 */
        if (!isJoinMuted && newState.mute && newState.channel) {
          await newState.member?.voice.setMute(false);
        }
      } catch (error) {
        console.error(error);
      }
    },
  );
};
