import axios from 'axios';

const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const API_KEY = process.env.API_KEY;

export const getTopHeadlines = async (date: string, query: string): Promise<any> => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
        q: query,
        apiKey: API_KEY
      }
    });
    console.log(response.data.articles);
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news headlines:', error);
    throw new Error('Failed to fetch news headlines');
  }
};

export const getAllHeadlines = async (date: string, query: string): Promise<any> => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  console.log("Fetching news articles from News API");

  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
        q: query,
        apiKey: API_KEY,
        language: "en"
      }
    });
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news headlines:', error);
    throw new Error('Failed to fetch news headlines');
  }
};