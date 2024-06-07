import { gql } from '@apollo/client';

export const GET_USER_INTERESTS = gql`
  query GetUserInterests {
    getUserInterests
  }
`;

export const ADD_INTEREST = gql`
  mutation AddInterest($interestName: String!) {
    addInterest(interestName: $interestName)
  }
`;

export const REMOVE_INTEREST = gql`
  mutation RemoveInterest($interestName: String!) {
    removeInterest(interestName: $interestName)
  }
`;
