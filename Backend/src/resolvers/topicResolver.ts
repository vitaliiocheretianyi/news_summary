// src/graphql/resolvers.ts
import TopicModel from '../models/Topic'; // Update the path as needed
import { verifyToken } from '../utils/tokenUtils'; // Update the path as needed

export const resolvers = {
  Query: {
    getAllTopics: async (_, __, context) => {
      //verifyToken(context.token);  // Verifying the token
      return await TopicModel.find({});
    },
    getTopic: async (_, { name }, context) => {
      //verifyToken(context.token);  // Verifying the token
      return await TopicModel.findOne({ name });
    },
    getAllWeeks: async (_, __, context) => {
      //verifyToken(context.token);  // Verifying the token
      return await TopicModel.aggregate([
        { $unwind: '$weeks' },
        { $replaceRoot: { newRoot: '$weeks' } }
      ]);
    },
    getWeekByDate: async (_, { startDate, endDate }, context) => {
      //verifyToken(context.token);  // Verifying the token
      const week = await TopicModel.findOne({
        'weeks.startDate': new Date(startDate),
        'weeks.endDate': new Date(endDate)
      }, { 'weeks.$': 1 });
      return week ? week.weeks[0] : null;
    }
  },
  Mutation: {
    createTopic: async (_, { name }, context) => {
      //verifyToken(context.token);  // Verifying the token
      const existingTopic = await TopicModel.findOne({ name });
      if (existingTopic) {
        throw new Error('Topic already exists.');
      }
      return new TopicModel({ name, weeks: [] }).save();
    },
    addWeekToTopic: async (_, { topicName, startDate, endDate, summary }, context) => {
      //verifyToken(context.token);  // Token verification for security
      const topic = await TopicModel.findOne({ name: topicName });
      if (!topic) {
        throw new Error('Topic not found.');
      }
      const newWeek = { startDate: new Date(startDate), endDate: new Date(endDate), summary, newsPosts: [] };
      if (topic.weeks.some(week => new Date(week.startDate) <= new Date(endDate) && new Date(week.endDate) >= new Date(startDate))) {
        throw new Error('Week dates overlap with an existing week.');
      }
      topic.weeks.push(newWeek);
      return topic.save();
    }
  }
};
