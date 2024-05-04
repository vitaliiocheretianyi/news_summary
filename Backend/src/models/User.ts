import mongoose, { Document, Model, Schema } from 'mongoose';

// model for the user, it is consumed by mongodb
// and the following values will be reflected in 
// the User document in the database
interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const User = mongoose.model<IUser>('User', userSchema);


