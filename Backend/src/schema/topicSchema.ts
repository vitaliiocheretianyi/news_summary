// src/graphql/typeDefs.ts
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type NewsPost {
    date: String!
    summary: String!
    url: String!
  }

  type Week {
    startDate: String!
    endDate: String!
    summary: String!
    newsPosts: [NewsPost!]!
  }

  type Topic {
    name: String!
    weeks: [Week!]!
  }

  type Query {
    getAllTopics: [Topic!]!
    getTopic(name: String!): Topic
    getAllWeeks: [Week!]!
    getWeekByDate(startDate: String!, endDate: String!): Week
  }

  type Mutation {
    createTopic(name: String!): Topic
    addWeekToTopic(topicName: String!, startDate: String!, endDate: String!, summary: String!): Week
  }
`;
