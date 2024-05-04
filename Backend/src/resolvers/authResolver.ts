import { User } from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { validateEmail } from '../utils/emailUtils'; // Import the validateEmail function
import { validatePassword } from '../utils/passwordUtils'; // Import the validatePassword function

export const resolvers = {
  Mutation: {
    async register(_: any, args: { username: string; email: string; password: string }) {
      // Validate email
      if (!validateEmail(args.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password
      if (!validatePassword(args.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }

      const hashedPassword = await hashPassword(args.password);
      const user = new User({
        username: args.username,
        email: args.email,
        password: hashedPassword
      });

      try {
        await user.save();
      } catch (error) {
        throw new Error('Error saving user: ' + error.message);
      }

      const token = generateToken(user.id);
      return { token };
    },

    async loginWithUsername(_: any, args: { username: string; password: string }) {
      const user = await User.findOne({ username: args.username });
      if (!user || !(await comparePassword(args.password, user.password))) {
        throw new Error('Invalid credentials');
      }
      const token = generateToken(user.id);
      return { token };
    },

    async loginWithEmail(_: any, args: { email: string; password: string }) {
      // Validate email
      if (!validateEmail(args.email)) {
        throw new Error('Invalid email format');
      }

      const user = await User.findOne({ email: args.email });
      if (!user || !(await comparePassword(args.password, user.password))) {
        throw new Error('Invalid credentials');
      }
      const token = generateToken(user.id);
      return { token };
    }
  }
};
