import mongoose from 'mongoose';

interface NewsPost {
    date: Date;
    summary: string;
    url: string;
}

interface Week {
    startDate: Date;
    endDate: Date;
    summary: string;
    newsPosts: NewsPost[];
}

interface TopicDocument extends mongoose.Document {
    name: string;
    weeks: Week[];
}

const newsPostSchema = new mongoose.Schema<NewsPost>({
    date: { type: Date, required: true },
    summary: { type: String, required: true },
    url: { type: String, required: true }
});

const weekSchema = new mongoose.Schema<Week>({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    summary: { type: String, required: true },
    newsPosts: [newsPostSchema]
});

const topicSchema = new mongoose.Schema<TopicDocument>({
    name: { type: String, required: true, unique: true},
    weeks: { type: [weekSchema], required: true }
});

const TopicModel = mongoose.model<TopicDocument>('Topic', topicSchema);

export default TopicModel;
