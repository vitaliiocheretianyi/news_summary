import { User } from '../models/User';
import { UserInterest } from '../models/UserInterest';
import { hashPassword } from '../utils/auth';

export const resolvers = {
  Query: {
    async getUser(_: any, args, context: { user: any }) {
      if (!context.user) {
        console.log("You must be logged in");
        return { success: false, message: "You must be logged in" };
      }
      const user = await User.findById(args.id);
      if (!user) {
        console.log("User not found");
        return { success: false, message: "User not found" };
      }

      return user;
    }
  },
  Mutation: {
    async changeUsername(_: any, { username }: { username: string }, context: { user: any }) {
      if (!context.user) {
        console.log("You must be logged in");
        return { success: false, message: "You must be logged in" };
      }
      try {
        const user = await User.findById(context.user.id);
        if (!user) {
          console.log("User not found");
          return { success: false, message: "User not found" };
        }

        user.username = username;
        await user.save();
  
        return { success: true, message: "Username updated successfully" };
      } catch (error) {
        console.log(error);
        return { success: false, message: "An error occurred while changing username" };
      }
    },
    async changeEmail(_: any, { email }: { email: string }, context: { user: any }) {
      if (!context.user) {
        console.log("You must be logged in");
        return { success: false, message: "You must be logged in" };
      }
      try {
        const user = await User.findById(context.user.id);
        if (!user) {
          console.log("User not found");
          return { success: false, message: "User not found" };
        }

        user.email = email;
        await user.save();
  
        return { success: true, message: "Email updated successfully" };
      } catch (error) {
        console.log(error);
        return { success: false, message: "An error occurred while changing email" };
      }
    },
    async changePassword(_: any, { newPassword }: { newPassword: string }, context: { user: any }) {
      if (!context.user) {
        console.log("You must be logged in");
        return { success: false, message: "You must be logged in" };
      }
      try {
        const user = await User.findById(context.user.id);
        if (!user) {
          console.log("User not found");
          return { success: false, message: "User not found" };
        }

        user.password = await hashPassword(newPassword);
        await user.save();
  
        return { success: true, message: "Password updated successfully" };
      } catch (error) {
        console.log(error);
        return { success: false, message: "An error occurred while changing password" };
      }
    },
    async deleteAccount(_: any, args, context: { user: any }) {
      if (!context.user) {
        console.log("You must be logged in");
        return { success: false, message: "You must be logged in" };
      }
      try {
        const user = await User.findById(context.user.id);
        if (!user) {
          console.log("User not found");
          return { success: false, message: "User not found" };
        }

        await UserInterest.deleteMany({ userId: user.id });
        await User.findByIdAndDelete(user.id);
  
        return { success: true, message: "Account deleted successfully" };
      } catch (error) {
        console.log(error);
        return { success: false, message: "An error occurred while deleting the account" };
      }
    }
  }
};
