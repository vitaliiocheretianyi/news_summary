import TopicModel from '../models/Topic'; // Adjust the path as necessary
import { UserInterest } from '../models/UserInterest'; // Adjust the path as necessary
import { AuthenticationError } from 'apollo-server-express';

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

        const userId = user.id;

        const userInterest = await UserInterest.findOne({ userId });
        if (userInterest) {
          userInterest.interests.push(topic.id);
          await userInterest.save();
        } else {
          const newUserInterest = new UserInterest({ userId, interests: [topic.id] });
          await newUserInterest.save();
        }

        return topic;
      } catch (error) {
        console.error(error);
        throw new Error('Error adding topic');
      }
    }
  }
};
