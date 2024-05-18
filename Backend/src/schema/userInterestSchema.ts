import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type UserInterest {
    userId: ID!
    interests: [String]
  }

  type Query {
    getUserInterests(userId: ID!): UserInterest
  }

  type Mutation {
    addInterest(userId: ID!, interestName: String!): UserInterest
    updateInterest(userId: ID!, oldInterestName: String!, newInterestName: String!): UserInterest
    removeInterest(userId: ID!, interestName: String!): UserInterest
  }
`;
