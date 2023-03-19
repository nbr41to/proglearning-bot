import { Client, Events, VoiceState } from 'discord.js';

export const autoMutedListener = (client: Client): void => {
  client.on(
    Events.VoiceStateUpdate,
    async (oldState: VoiceState, newState: VoiceState) => {
      if (oldState.channel?.id === newState.channel?.id) return;
      try {
        const mokumokuChannelId = process.env.DISCORD_MUTED_CHANNEL_ID ?? '';
        const isJoinMokumoku = newState.channel?.id === mokumokuChannelId;

        /* mokumokuに入ったらミュート */
        if (!newState.mute && isJoinMokumoku) {
          await newState.member?.voice.setMute(true);
        }

        /* mokumokuから退室でミュート解除 */
        const isLeaveMokumoku = oldState.channel?.id === mokumokuChannelId;
        if (isLeaveMokumoku && newState.mute && newState.channel) {
          await oldState.member?.voice.setMute(false);
        }

        /* mokumokuじゃない部屋に入った場合にミュートを解除 */
        if (!isJoinMokumoku && newState.mute && newState.channel) {
          // console.log('mokumokuから出たらミュート解除');
          await newState.member?.voice.setMute(false);
        }
      } catch (error) {
        console.error(error);
      }
    },
  );
};
