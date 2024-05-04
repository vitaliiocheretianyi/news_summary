import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Mutation {
    changePassword(oldPassword: String!, newPassword: String!): Response
    changeUsername(newUsername: String!): Response
    changeEmail(newEmail: String!): Response
    deleteAccount: Response
  }

  type Response {
    success: Boolean!
    message: String!
  }

  type Query {
    _: Boolean
  }
`;
