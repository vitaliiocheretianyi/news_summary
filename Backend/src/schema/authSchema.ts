import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    verifyToken: Boolean!
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthResponse
    loginWithUsername(username: String!, password: String!): AuthResponse
    loginWithEmail(email: String!, password: String!): AuthResponse
  }

  type AuthResponse {
    token: String
    error: String
  }
`;
