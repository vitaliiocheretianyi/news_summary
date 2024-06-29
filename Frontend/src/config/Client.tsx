import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const GRAPHQL_URI = process.env.REACT_APP_GRAPHQL_URI;

// Log the source of the URL
if (process.env.REACT_APP_GRAPHQL_URI) {
  console.log(`Using GraphQL URI from .env file: ${GRAPHQL_URI}`);
} else {
  console.log(`Using default GraphQL URI: ${GRAPHQL_URI}`);
}

const httpLink = new HttpLink({
  uri: GRAPHQL_URI,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
