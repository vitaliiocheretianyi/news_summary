import { User } from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { validateEmail } from '../utils/emailUtils'; // Import the validateEmail function from the utility file
import { validatePassword } from '../utils/passwordUtils'; // Import the validatePassword function from the utility file

export const resolvers = {
  Mutation: {
    async register(_: any, args: { username: string; email: string; password: string }) {
      // Validate email format
      if (!validateEmail(args.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength and complexity
      if (!validatePassword(args.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }

      // Hash the valid password
      const hashedPassword = await hashPassword(args.password);
      // Create and save the new user with validated email and hashed password
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

      // Generate token for the new user
      const token = generateToken(user.id);
      return { token };
    },

    async loginWithUsername(_: any, args: { username: string; password: string }) {
      // Find user by username and validate password
      const user = await User.findOne({ username: args.username });
      if (!user || !(await comparePassword(args.password, user.password))) {
        throw new Error('Invalid credentials');
      }
      // Generate token for logged in user
      const token = generateToken(user.id);
      return { token };
    },

    async loginWithEmail(_: any, args: { email: string; password: string }) {
      // Validate email format
      if (!validateEmail(args.email)) {
        throw new Error('Invalid email format');
      }
      // Find user by email and validate password
      const user = await User.findOne({ email: args.email });
      if (!user || !(await comparePassword(args.password, user.password))) {
        throw new Error('Invalid credentials');
      }
      // Generate token for logged in user
      const token = generateToken(user.id);
      return { token };
    },

    async deleteAccount(_: any, args, context: { user: any }) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      // Ensure the user can only delete their own account
      const user = await User.findById(context.user.id);
      if (!user) {
        throw new Error("User not found");
      }

      if (user.id !== context.user.id) {
        throw new Error("Unauthorized access to delete account");
      }

      await User.findByIdAndDelete(user.id);
      return { success: true, message: "Account deleted successfully" };
    }
  }
};
