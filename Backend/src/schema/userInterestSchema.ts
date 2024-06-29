import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Topic {
    id: ID!
    name: String!
  }

  type UserInterest {
    userId: ID!
    interests: [Topic]
  }

  type Query {
    getUserInterests: [String]
  }

  type Mutation {
    addInterest(interestName: String!): Boolean
    removeInterest(interestName: String!): Boolean
  }
`;
