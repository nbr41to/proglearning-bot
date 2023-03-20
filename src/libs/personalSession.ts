import {
  PersonalSessionCreateInput,
  PersonalSessionUpdateInput,
} from 'src/types/session';
import { PersonalSession } from 'src/types/session';
import axios from 'axios';

const baseUrl = process.env.PROGLEARNING_API_BASE_URL ?? '';
const apiKey = process.env.PROGLEARNING_API_KEY ?? '';
const encodedApiKey = Buffer.from(apiKey).toString('base64');

axios.defaults.headers.common['Authorization'] = 'Bearer ' + encodedApiKey;
axios.defaults.headers.common['Content-Type'] = 'application/json';

/* 最新のSessionを取得 */
export const getLatestPersonalSession = async () => {
  try {
    const response = await axios.get<PersonalSession>(
      `${baseUrl}/discord-sessions/personals`,
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* PersonalSessionの新規作成 */
export const createPersonalSession = async (
  params: PersonalSessionCreateInput,
) => {
  try {
    const response = await axios.post<PersonalSession>(
      `${baseUrl}/discord-sessions/personals`,
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

/* PersonalSessionの更新 */
export const updatePersonalSession = async (
  params: PersonalSessionUpdateInput,
) => {
  try {
    const response = await axios.patch<PersonalSession>(
      `${baseUrl}/discord-sessions/personals/${params.id}`,
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
