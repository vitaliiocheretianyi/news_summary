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

export const EXTRACT_DAYS_NEWS_ARTICLES = gql`
  mutation ExtractDaysNewsArticles($date: String!, $query: String!) {
    extractDaysNewsArticles(date: $date, query: $query) {
      success
      newsPosts {
        date
        title
        imageUrl
        shortDescription
        url
      }
    }
  }
`;

export const HANDLE_NEWS_REQUEST = gql`
  mutation HandleNewsRequest($topicName: String!, $date: String!) {
    handleNewsRequest(topicName: $topicName, date: $date) {
      success
      newsPosts {
        date
        title
        imageUrl
        shortDescription
        url
      }
    }
  }
`;
