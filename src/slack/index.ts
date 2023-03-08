import { app } from './app';
import dotenv from 'dotenv';
dotenv.config();

export const startBoltApp = async (): Promise<void> => {
  await app.start(process.env.PORT || 8000);
  console.log('⚡️ Bolt app is running!');
};
