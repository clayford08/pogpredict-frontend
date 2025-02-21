import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/104657/poggers/version/latest';

const httpLink = new HttpLink({
  uri: SUBGRAPH_URL
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([httpLink]),
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
      fetchPolicy: 'network-only'
    },
    query: {
      fetchPolicy: 'network-only'
    }
  }
});
