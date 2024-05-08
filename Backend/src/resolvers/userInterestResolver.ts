// graphql/resolvers.ts
import { UserInterest } from '../models/UserInterest';
import { verifyToken } from '../utils/tokenUtils';


export const resolvers = {
  Query: {
    getUserInterests: async (_: any, { userId }: { userId: string }) => {
      return await UserInterest.findOne({ userId });
    },
  },
  Mutation: {
    addInterest: async (_: any, { userId, interestName }: { userId: string, interestName: string }, context: { token: string }) => {
      verifyToken(context.token);
      return await UserInterest.findOneAndUpdate(
        { userId },
        { $addToSet: { interests: interestName } },
        { new: true, upsert: true }
      );
    },
    updateInterest: async (_: any, { userId, oldInterestName, newInterestName }: { userId: string, oldInterestName: string, newInterestName: string }, context: { token: string }) => {
      verifyToken(context.token);
      return await UserInterest.findOneAndUpdate(
        { userId, interests: oldInterestName },
        { $set: { "interests.$": newInterestName } },
        { new: true }
      );
    },
    removeInterest: async (_: any, { userId, interestName }: { userId: string, interestName: string }, context: { token: string }) => {
      verifyToken(context.token);
      return await UserInterest.findOneAndUpdate(
        { userId },
        { $pull: { interests: interestName } },
        { new: true }
      );
    }
  }
};
