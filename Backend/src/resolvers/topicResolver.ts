import TopicModel from '../models/Topic'; // Adjust the path as necessary
import { AuthenticationError } from 'apollo-server-express';
import { getTopHeadlines, getAllHeadlines } from "../services/newsApiService"
export const resolvers = {
  Query: {
    searchTopics: async (_, { name }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const topics = await TopicModel.find({
          name: { $regex: name, $options: 'i' }
        }).limit(3);

        if (!topics.length) {
          return [];
        }

        return topics;
      } catch (error) {
        console.error(error);
        throw new Error('Error searching for topics');
      }
    },
    getNewsByDateAndTopic: async (_, { topicName, date }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const topic = await TopicModel.findOne({ name: topicName, 'days.date': new Date(date) });
        if (!topic) {
          return null;
        }

        const day = topic.days.find(day => day.date.toISOString().split('T')[0] === date);
        return day || null;
      } catch (error) {
        console.error(error);
        throw new Error('Error fetching news for the specified date and topic');
      }
    }
  },
  Mutation: {

    addTopic: async (_, { name }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        let topic = await TopicModel.findOne({ name });
        if (!topic) {
          topic = new TopicModel({ name });
          await topic.save();
        }

        return topic;
      } catch (error) {
        console.error(error);
        throw new Error('Error adding topic');
      }
    },

    extractDaysNewsArticles: async (_, { topicName, date, query }, { user }) => {
      console.log("Request to get news articles received");
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      const userId = user.id;
      console.log(`Extracting news articles for topic "${topicName}" on date "${date}" for userId: ${userId}`);

      let topic = await TopicModel.findOne({ name: topicName });
      if (!topic) {
        console.log(`Topic "${topicName}" not found. Creating new topic.`);
        topic = new TopicModel({ name: topicName, days: [] });
        await topic.save();
        console.log(`New topic "${topicName}" created.`);
      }

      // Fetch news articles from the API
      let newsArticles = await getTopHeadlines(date, query); // Ensure all parameters are used
      if (!newsArticles.length) {
        console.log(`No news articles found for topic "${topicName}" on date "${date}".`);
        return { success: true, newsPosts: [] };
      }

      const formattedDate = new Date(date);

      const day = {
        date: formattedDate,
        newsPosts: newsArticles.map(article => ({
          date: new Date(article.publishedAt),
          title: article.title,
          imageUrl: article.urlToImage,
          shortDescription: article.description,
          url: article.url
        }))
      };

      topic.days.push(day);
      await topic.save();

      console.log(`Updated topic "${topicName}" with news articles for date "${date}"`);
      return { success: true, newsPosts: day.newsPosts }; // Return true to indicate success
    },

    handleNewsRequest: async (_, { topicName, date }, { user }) => {
      if (!user) {
          throw new AuthenticationError('You must be logged in');
      }
  
      const userId = user.id;
      console.log(`Handling news request for user "${userId}" with topic "${topicName}" and date "${date}"`);
  
      const formattedDate = new Date(date);
  
      // Search for news articles based on the date and topic name
      const topic = await TopicModel.findOne({
          name: topicName,
          'days.date': formattedDate
      });
  
      if (topic) {
          const existingDay = topic.days.find(day => day.date.toISOString().split('T')[0] === formattedDate.toISOString().split('T')[0]);
          if (existingDay && existingDay.newsPosts.length > 0) {
              console.log('News articles found:', existingDay.newsPosts);
              return { success: true, newsPosts: existingDay.newsPosts }; // Indicate success and return news articles
          }
      }
  
      console.log('No existing news articles found');
      // If no articles are found, proceed to fetch new headlines
      let response = await getAllHeadlines(date, topicName);
      console.log("Number of articles: ", response.length);
      
      // Filter out items with null title, description, url, or "[removed]" in the title
      response = response.filter(item => item.title && item.url && !item.title.includes('[Removed]'));
      console.log("Filtered articles: ", response.length);
      
      let newsPosts = response.map(item => ({
          title: item.title,
          imageUrl: item.urlToImage,
          shortDescription: item.description,
          url: item.url
      }));
  
      console.log("Number news items extracted: ", newsPosts.length);
  
      // Only update if there are new news posts
      if (newsPosts.length > 0) {
          console.log("News articles extracted");
  
          try {
              // Check if the topic already exists
              let existingTopic = await TopicModel.findOne({ name: topicName });
              if (existingTopic) {
                  console.log("Topic found in the database");
  
                  // Add a new day entry
                  console.log("Adding a new day entry");
                  existingTopic.days.push({ date: formattedDate, newsPosts: newsPosts });
                  await existingTopic.save();
                  console.log("New day entry successfully added");
              } else {
                  console.log("Topic was not found in the database");
                  // Create a new topic with the day entry
                  await TopicModel.create({
                      name: topicName,
                      days: [{ date: formattedDate, newsPosts: newsPosts }]
                  });
                  console.log("New topic successfully created");
              }
              console.log("\nReceived a response from the backend and updated the topic with new news posts\n");
              return { success: true, newsPosts: newsPosts }; // Indicate success and return new news articles
          } catch (error) {
              console.error("Error saving to the database:", error);
              return { success: false, newsPosts: [] }; // Indicate failure and return an empty array
          }
      }
  
      console.log("\nNo news posts received from the backend\n");
      return { success: false, newsPosts: [] }; // Indicate failure and return an empty array
    }
  
  
  
  
  
  }
};

export default resolvers;
