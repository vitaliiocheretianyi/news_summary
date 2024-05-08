// graphql/typeDefs.ts
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type UserInterest {
    userId: ID!
    interests: [String]
  }

  type Query {
    getUserInterests(userId: ID!): User
  }

  type Mutation {
    addInterest(userId: ID!, interestName: String!): User
  }
`;
