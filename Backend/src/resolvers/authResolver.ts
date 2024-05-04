import { User } from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const authResolver = {
  Mutation: {
    async register(_: any, args: { username: string; email: string; password: string }) {
      const hashedPassword = await hashPassword(args.password);
      const user = new User({
        username: args.username,
        email: args.email,
        password: hashedPassword
      });
      await user.save();
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
      const user = await User.findOne({ email: args.email });
      if (!user || !(await comparePassword(args.password, user.password))) {
        throw new Error('Invalid credentials');
      }
      const token = generateToken(user.id);
      return { token };
    }
  }
};

export default authResolver;
