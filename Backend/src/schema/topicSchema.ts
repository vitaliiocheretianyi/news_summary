import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type NewsPost {
    date: String
    summary: String
    url: String
  }

  type Week {
    startDate: String
    endDate: String
    summary: String
    newsPosts: [NewsPost]
  }

  type Topic {
    id: ID!
    name: String!
    weeks: [Week]
  }

  type Query {
    searchTopics(name: String!): [Topic]
  }

  type Mutation {
    addTopic(name: String!): Topic
  }
`;
