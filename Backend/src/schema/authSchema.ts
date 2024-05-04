import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload
    loginWithUsername(username: String!, password: String!): AuthPayload
    loginWithEmail(email: String!, password: String!): AuthPayload
  }

  type AuthPayload {
    token: String!
  }
`;
