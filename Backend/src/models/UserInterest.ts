// models/UserInterest.ts
import mongoose from 'mongoose';

const userInterestSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  interests: [{ type: String }],
});

export const UserInterest = mongoose.model('UserInterest', userInterestSchema);
