import { gql } from '@apollo/client';

export const SEARCH_TOPICS = gql`
  query SearchTopics($name: String!) {
    searchTopics(name: $name) {
      name
    }
  }
`;

export const ADD_TOPIC = gql`
  mutation AddTopic($name: String!) {
    addTopic(name: $name) {
      id
      name
    }
  }
`;
