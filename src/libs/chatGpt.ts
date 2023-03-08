import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const postChat = async (
  messages: { role: string; content: string }[],
) => {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages,
    },
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    },
  );

  if (!response.data) return 'No response from OpenAI API';

  return response.data.choices[0].message.content;
};
