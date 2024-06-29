import { gql } from 'apollo-server-express';

export const typeDefs = gql`
type Mutation {
  changeUsername(username: String!): Response
  changeEmail(email: String!): Response
  changePassword(newPassword: String!): Response
  deleteAccount: Response
}

type Query {
  getUser(id: String!): User
}

type User {
  id: ID!
  username: String!
  email: String!
  password: String!
}

type Response {
  success: Boolean!
  message: String!
}
`;
