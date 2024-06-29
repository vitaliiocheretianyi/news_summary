import mongoose from 'mongoose';

interface NewsPost {
  title: string;
  imageUrl: string;
  shortDescription: string;
  url: string;
}

interface Day {
  date: Date;
  newsPosts: NewsPost[];
}

interface TopicDocument extends mongoose.Document {
  name: string;
  days: Day[];
}

const newsPostSchema = new mongoose.Schema<NewsPost>({
  title: { type: String, required: true },
  imageUrl: { type: String },
  shortDescription: { type: String },
  url: { type: String, required: true }
});

const daySchema = new mongoose.Schema<Day>({
  date: { type: Date, required: true },
  newsPosts: [newsPostSchema]
});

const topicSchema = new mongoose.Schema<TopicDocument>({
  name: { type: String, required: true, unique: true },
  days: { type: [daySchema], required: true }
});

const TopicModel = mongoose.model<TopicDocument>('Topic', topicSchema);

export default TopicModel;
