import axios from 'axios';

const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const API_KEY = 'your_newsapi_api_key';

export const getTopHeadlines = async (country: string): Promise<any> => {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        country,
        apiKey: API_KEY
      }
    });
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news headlines:', error);
    throw new Error('Failed to fetch news headlines');
  }
};
