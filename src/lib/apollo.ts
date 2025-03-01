import { ApolloClient, InMemoryCache, ApolloLink, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/104657/poggers/version/latest';

const httpLink = new HttpLink({
  uri: SUBGRAPH_URL
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        keyFields: ['id'],
        fields: {
          monthlyStats: {
            merge: false // Replace instead of merge for monthly stats array
          },
          bets: {
            merge: false // Replace instead of merge for bets array
          }
        }
      },
      Market: {
        keyFields: ['id'],
        fields: {
          priceHistory: {
            merge: false // Replace instead of merge for price history array
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all' // Continue with partial results on error
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all' // Continue with partial results on error
    }
  }
});
