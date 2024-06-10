import axios from 'axios';

const CHATGPT_API_URL = 'https://api.openai.com/v1/engines/davinci-codex/completions';
const API_KEY = 'your_chatgpt_api_key';

export const getChatGPTResponse = async (prompt: string): Promise<any> => {
  try {
    const response = await axios.post(
      CHATGPT_API_URL,
      {
        prompt,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching ChatGPT response:', error);
    throw new Error('Failed to fetch ChatGPT response');
  }
};
