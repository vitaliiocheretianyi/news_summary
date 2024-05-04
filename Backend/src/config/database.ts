import mongoose from 'mongoose';

// connect to mongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // Since err is of type unknown, you need to assert the type or use optional chaining if possible
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
