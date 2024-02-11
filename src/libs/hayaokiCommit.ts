import axios, {AxiosError} from 'axios';

/**
 * PixelaのAPIを叩く
 */
const pixelaBaseUrl = 'https://pixe.la';

/* 今日のCommitを取得 */
const getPixelaGraph = async (discordId: string) => {
  try {
    const yyyyMMdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const response = await axios.get(
      `${pixelaBaseUrl}/v1/users/hyok-${discordId}/graphs/hayaoki-graph/${yyyyMMdd}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-USER-TOKEN': `token:hyok-${discordId}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if ((error as AxiosError).response?.status === 404) return null;

    console.error((error as AxiosError).message);
    throw error;
  }
};

/* 今日のCommitを追加 */
const postPixelaGraph = async (
  discordId: string,
  quantity: number,
  optionalData?: string
) => {
  try {
    const yyyyMMdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const response = await axios.post(
      `${pixelaBaseUrl}/v1/users/hyok-${discordId}/graphs/hayaoki-graph`,
      {
        date: yyyyMMdd,
        quantity: quantity.toString(),
        ...(optionalData && {optionalData}),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-USER-TOKEN': `token:hyok-${discordId}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error((error as AxiosError).message);

    throw error;
  }
};

/* 今日のCommitを更新 */
const putPixelaGraph = async (
  discordId: string,
  quantity: number,
  optionalData: string
) => {
  try {
    const yyyyMMdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const response = await axios.put(
      `${pixelaBaseUrl}/v1/users/hyok-${discordId}/graphs/hayaoki-graph/${yyyyMMdd}`,
      {
        quantity: quantity.toString(),
        ...(optionalData && {optionalData}),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-USER-TOKEN': `token:hyok-${discordId}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error((error as AxiosError).message);

    throw error;
  }
};

/* 朝活の開始 */
export const initialCommitPixelaGraph = async (discordId: string) => {
  try {
    const todayCommit = await getPixelaGraph(discordId);
    console.log('todayCommit', todayCommit);
    if (todayCommit) return;

    const HHmm = new Date().toISOString().slice(11, 16);
    const optionalData = {
      am7: HHmm,
    };
    const json = JSON.stringify(optionalData);
    await postPixelaGraph(discordId, 1, json);
  } catch (error) {
    console.error((error as AxiosError).message);
  }
};

/* 朝活の達成 */
export const completeCommitPixelaGraph = async (discordId: string) => {
  try {
    const todayCommit = await getPixelaGraph(discordId);
    if (!todayCommit) return;
    if (!todayCommit?.optionalData) return;
    const optionalData = JSON.parse(todayCommit.optionalData);
    if (optionalData.am7 === 'completed') return;
    if (optionalData.am7 === 'broke') return;

    // ※朝活時間が25分未満または60分以上の場合は朝活達成とみなさない
    const start = new Date(
      `${new Date().toISOString().slice(0, 10)}T${optionalData.am7}`
    );
    const end = new Date();
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (60 < minutes || minutes < 25) return;

    // 朝活の達成
    const quantity = Number(todayCommit.quantity) + 2;
    const newOptionalData = {
      am7: 'completed',
    };
    const json = JSON.stringify(newOptionalData);
    await putPixelaGraph(discordId, quantity, json);
  } catch (error) {
    console.error((error as AxiosError).message);
  }
};

/* 朝活後の休憩室に参加 */
export const brokeCommitPixelaGraph = async (discordId: string) => {
  try {
    const todayCommit = await getPixelaGraph(discordId);
    if (!todayCommit) return;
    if (!todayCommit?.optionalData) return;
    const optionalData = JSON.parse(todayCommit.optionalData);
    if (optionalData.am7 !== 'completed') return;

    const quantity = Number(todayCommit.quantity) + 2;
    const newOptionalData = {
      am7: 'broke',
    };
    const json = JSON.stringify(newOptionalData);
    await putPixelaGraph(discordId, quantity, json);
  } catch (error) {
    console.error((error as AxiosError).message);
  }
};
