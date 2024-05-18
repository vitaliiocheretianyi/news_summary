import { User } from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { validateEmail } from '../utils/emailUtils'; // Import the validateEmail function
import { validatePassword } from '../utils/passwordUtils'; // Import the validatePassword function
import jwt from 'jsonwebtoken';

export const resolvers = {
  Query: {
    async verifyToken(_: any, __: any, context: { user: any, token: string }) {
        return context.user != null;
    }
  },
  Mutation: {
    async register(_: any, args: { username: string; email: string; password: string }) {
      // Validate email
      if (!validateEmail(args.email)) {
        return { error: 'Invalid email format' };
      }

      // Validate password
      if (!validatePassword(args.password)) {
        return { error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' };
      }

      const existingUser = await User.findOne({ $or: [{ username: args.username }, { email: args.email }] });
      if (existingUser) {
        return { error: 'Username or email is already taken' };
      }

      const hashedPassword = await hashPassword(args.password);
      const user = new User({
        username: args.username,
        email: args.email,
        password: hashedPassword
      });

      try {
        await user.save();
        const token = generateToken(user.id);
        return { token };
      } catch (error) {
        return { error: 'Error saving user: ' + error.message };
      }
    },

    async loginWithUsername(_: any, args: { username: string; password: string }) {
      const user = await User.findOne({ username: args.username });
      if (!user || !(await comparePassword(args.password, user.password))) {
        return { error: 'Invalid credentials' };
      }
      const token = generateToken(user.id);
      return { token };
    },

    async loginWithEmail(_: any, args: { email: string; password: string }) {
      // Validate email
      if (!validateEmail(args.email)) {
        return { error: 'Invalid email format' };
      }

      const user = await User.findOne({ email: args.email });
      if (!user || !(await comparePassword(args.password, user.password))) {
        return { error: 'Invalid credentials' };
      }
      const token = generateToken(user.id);
      return { token };
    }
  }
};
