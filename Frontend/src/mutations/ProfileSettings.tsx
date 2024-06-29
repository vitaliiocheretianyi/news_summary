import { gql } from '@apollo/client';

export const CHANGE_USERNAME = gql`
  mutation ChangeUsername($username: String!) {
    changeUsername(username: $username) {
      success
      message
    }
  }
`;

export const CHANGE_EMAIL = gql`
  mutation ChangeEmail($email: String!) {
    changeEmail(email: $email) {
      success
      message
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($newPassword: String!) {
    changePassword(newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount {
    deleteAccount {
      success
      message
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: String!) {
    getUser(id: $id) {
      id
      username
      email
      password
    }
  }
`;
