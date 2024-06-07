import { UserInterest } from '../models/UserInterest';
import TopicModel from '../models/Topic';
import { AuthenticationError } from 'apollo-server-express';

export const resolvers = {
  Query: {
    getUserInterests: async (_: any, __: any, { user }: { user: { id: string } }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }
      const userId = user.id;
      console.log(`Fetching user interests for userId: ${userId}`);
      
      const userInterests = await UserInterest.findOne({ userId });

      if (!userInterests) {
        console.log(`No interests found for userId: ${userId}`);
        return [];
      }

      const topicIds = userInterests.interests;
      const topics = await TopicModel.find({ _id: { $in: topicIds } }, 'name');
      const topicNames = topics.map(topic => topic.name);

      console.log(`Interests found for userId: ${userId}:`, topicNames);
      return topicNames;
    },
  },
  Mutation: {
    addInterest: async (_: any, { interestName }: { interestName: string }, { user }: { user: { id: string } }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }
      const userId = user.id;
      console.log(`Adding interest "${interestName}" for userId: ${userId}`);

      let topic = await TopicModel.findOne({ name: interestName });
      if (!topic) {
        console.log(`Topic "${interestName}" not found. Creating new topic.`);
        topic = new TopicModel({ name: interestName });
        await topic.save();
        console.log(`New topic "${interestName}" created.`);
      }

      console.log(`Updating user interests for userId: ${userId} with topicId: ${topic._id}`);
      await UserInterest.findOneAndUpdate(
        { userId },
        { $addToSet: { interests: topic._id } },
        { new: true, upsert: true }
      ).populate('interests');

      console.log(`Updated user interests for userId: ${userId}`);
      return true; // Return true to indicate success
    },
    removeInterest: async (_: any, { interestName }: { interestName: string }, { user }: { user: { id: string } }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }
      const userId = user.id;
      console.log(`Removing interest "${interestName}" for userId: ${userId}`);

      const topic = await TopicModel.findOne({ name: interestName });
      if (!topic) {
        const errorMessage = `Topic "${interestName}" not found.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      console.log(`Updating user interests for userId: ${userId}, removing topicId: ${topic._id}`);
      const userInterest = await UserInterest.findOneAndUpdate(
        { userId },
        { $pull: { interests: topic._id } },
        { new: true }
      ).populate('interests');

      console.log(`Updated user interests for userId: ${userId}:`, userInterest.interests);

      const topicUsageCount = await UserInterest.countDocuments({ interests: topic._id });
      if (topicUsageCount === 0) {
        console.log(`No other users found with topicId: ${topic._id}. Deleting topic.`);
        await TopicModel.findByIdAndDelete(topic._id);
        console.log(`Topic "${interestName}" deleted.`);
      }

      return true; // Return true to indicate success
    }
  }
};
