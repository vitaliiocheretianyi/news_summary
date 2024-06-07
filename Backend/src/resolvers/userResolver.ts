import { User } from '../models/User';
import { UserInterest } from '../models/UserInterest';
import { verifyToken } from '../utils/tokenUtils';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { validateEmail } from '../utils/emailUtils'; 
import { validatePassword } from '../utils/passwordUtils'; 

export const resolvers = {
  Query: {
    async getUser(_: any, args, context: { token: string }) {
      //verifyToken(context.token);
      const user = await User.findById(args.id);
      if (!user) {
        throw new Error("User not found");
      }

      return user._id;
    }
  },
  Mutation: {
    async changeUsername(_: any, {username}: {username: string}, context: { user: any, token: string }) {
      if (!context.user) {
          throw new Error("Unauthorized");
      }
  
      const user = await User.findById(context.user.id);
      if (!user) {
          throw new Error("User not found");
      }
  
      if (user.id.toString() !== context.user.id) {
          throw new Error("Unauthorized access to delete account");
      }

      if (username) user.username = username;

      await user.save();
  
      return { success: true, message: "Username updated successfully" };
    },
    async changeEmail(_: any, {email}: {email: string}, context: { user: any, token: string }) {
      if (!context.user) {
          throw new Error("Unauthorized");
      }
  
      const user = await User.findById(context.user.id);
      if (!user) {
          throw new Error("User not found");
      }
  
      if (user.id.toString() !== context.user.id) {
          throw new Error("Unauthorized access to delete account");
      }

      if (email) user.email = email;

      await user.save();
  
      return { success: true, message: "email updated successfully" };
    },
    async changePassword(_: any, {password}: {password: string}, context: { user: any, token: string }) {
      if (!context.user) {
          throw new Error("Unauthorized");
      }
  
      const user = await User.findById(context.user.id);
      if (!user) {
          throw new Error("User not found");
      }
  
      if (user.id.toString() !== context.user.id) {
          throw new Error("Unauthorized access to delete account");
      }

      if (validatePassword(password)) user.password = await hashPassword(password);

      await user.save();
  
      return { success: true, message: "Password updated successfully" };
    },

    async deleteAccount(_: any, args, context: { user: any, token: string }) {
      if (!context.user) {
          throw new Error("Unauthorized");
      }
  
      const user = await User.findById(context.user.id);
      if (!user) {
          throw new Error("User not found");
      }
  
      if (user.id.toString() !== context.user.id) {
          throw new Error("Unauthorized access to delete account");
      }
  
      await UserInterest.deleteMany({ userId: user.id });
      await User.findByIdAndDelete(user.id);
  
      return { success: true, message: "Account deleted successfully" };
    }
  }
};
