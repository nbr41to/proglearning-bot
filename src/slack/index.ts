import { app } from './app';

export const startBoltApp = async (): Promise<void> => {
  await app.start(process.env.PORT || 8000);
  console.log('⚡️ Bolt app is running!');
};
