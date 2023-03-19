import { startBoltApp } from './slack';
import { startDiscordApp } from './discord';
import dotenv from 'dotenv';

dotenv.config();

startBoltApp();
startDiscordApp();
