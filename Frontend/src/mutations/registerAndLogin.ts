import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      token
      error
    }
  }
`;

export const LOGIN_WITH_USERNAME_MUTATION = gql`
  mutation LoginWithUsername($username: String!, $password: String!) {
    loginWithUsername(username: $username, password: $password) {
      token
      error
    }
  }
`;

export const LOGIN_WITH_EMAIL_MUTATION = gql`
  mutation LoginWithEmail($email: String!, $password: String!) {
    loginWithEmail(email: $email, password: $password) {
      token
      error
    }
  }
`;

export const VERIFY_TOKEN_QUERY = gql`
  query VerifyToken {
    verifyToken
  }
`;
