import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type NewsPost {
    date: String
    title: String
    imageUrl: String
    shortDescription: String
    url: String
  }

  type Day {
    date: String
    newsPosts: [NewsPost]
  }

  type Topic {
    id: ID!
    name: String!
    days: [Day]
  }

  type Query {
    searchTopics(name: String!): [Topic]
    getNewsByDateAndTopic(topicName: String!, date: String!): Day
  }

  type Mutation {
    addTopic(name: String!): Topic
    extractDaysNewsArticles(topicName: String!, date: String!, query: String!): ExtractDaysNewsArticlesResult
    handleNewsRequest(topicName: String!, date: String!): HandleNewsRequestResult
  }

  type ExtractDaysNewsArticlesResult {
    success: Boolean
    newsPosts: [NewsPost]
  }

  type HandleNewsRequestResult {
    success: Boolean
    newsPosts: [NewsPost]
  }
`;

export default typeDefs;
