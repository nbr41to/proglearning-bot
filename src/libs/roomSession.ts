import {
  RoomSessionCreateInput,
  RoomSessionUpdateInput,
} from 'src/types/session';
import { RoomSession } from 'src/types/session';
import axios from 'axios';

const baseUrl = process.env.PROGLEARNING_API_BASE_URL ?? '';
const apiKey = process.env.PROGLEARNING_API_KEY ?? '';
const encodedApiKey = Buffer.from(apiKey).toString('base64');

axios.defaults.headers.common['Authorization'] = 'Bearer ' + encodedApiKey;
axios.defaults.headers.common['Content-Type'] = 'application/json';

/* 最新のSessionを取得 */
export const getLatestRoomSession = async () => {
  try {
    const response = await axios.get<RoomSession>(
      `${baseUrl}/discord-sessions/rooms`,
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* RoomSessionの新規作成 */
export const createRoomSession = async (params: RoomSessionCreateInput) => {
  try {
    const response = await axios.post<RoomSession>(
      `${baseUrl}/discord-sessions/rooms`,
      params,
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* RoomSessionの更新 */
export const updateRoomSession = async (params: RoomSessionUpdateInput) => {
  try {
    const response = await axios.patch<RoomSession>(
      `${baseUrl}/discord-sessions/rooms/${params.slack_timestamp}`,
      params,
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* Sessionをすべて削除 */
export const deleteRoomSessions = async () => {
  try {
    const response = await axios.delete<RoomSession>(
      `${baseUrl}/discord-sessions/rooms`,
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error);

    return;
  }
};
