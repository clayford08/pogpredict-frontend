import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    users(where: { id: $id }) {
      id
      totalBets
      wins
      losses
      totalWinnings
      totalLost
      totalStaked
      lastActiveTimestamp
      currentStreak
      bestStreak
      largestWin
      largestLoss
      bets(orderBy: timestamp, orderDirection: desc, first: 100) {
        id
        market {
          id
          question
          optionA
          optionB
          outcome
          resolvedBy
          resolutionTimestamp
        }
        isOptionA
        amount
        timestamp
        claimed
        winnings
        outcome
      }
    }
  }
`;

export const GET_MARKET = gql`
  query GetMarket($id: ID!) {
    market(id: $id) {
      id
      creator {
        id
      }
      question
      optionA
      optionB
      category
      logoUrlA
      logoUrlB
      endTime
      oracleMatchId
      totalPoolA
      totalPoolB
      outcome
      resolvedBy
      resolutionDetails
      resolutionTimestamp
      createdAt
      currentPriceA
      currentPriceB
      priceHistory(orderBy: timestamp, orderDirection: asc, first: 100) {
        timestamp
        priceA
        priceB
        totalPoolA
        totalPoolB
      }
    }
  }
`;

export const GET_MARKETS = gql`
  query GetMarkets($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
    markets(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      question
      optionA
      optionB
      category
      logoUrlA
      logoUrlB
      endTime
      totalPoolA
      totalPoolB
      currentPriceA
      currentPriceB
      createdAt
      outcome
      resolvedBy
      resolutionDetails
      resolutionTimestamp
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($first: Int!, $skip: Int!, $orderBy: String!) {
    users(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: desc
    ) {
      id
      totalBets
      wins
      losses
      totalWinnings
      totalStaked
      currentStreak
      bestStreak
      largestWin
      largestLoss
    }
  }
`;

export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    globalStats(id: "global") {
      totalUsers
      totalMarkets
      totalBets
      totalVolumeStaked
      totalWinnings
      lastUpdateTimestamp
    }
  }
`;

export const GET_CLAIMABLE_MARKETS = gql`
  query GetClaimableMarkets($userAddress: ID!) {
    bets(
      where: { 
        user: $userAddress,
        claimed: false,
        market_: { 
          resolutionTimestamp_gt: 0,
          resolvedBy_not: null
        }
      }
    ) {
      id
      market {
        id
        question
        optionA
        optionB
        outcome
        resolvedBy
        resolutionDetails
        resolutionTimestamp
        totalPoolA
        totalPoolB
      }
      isOptionA
      amount
      winnings
      claimed
      outcome
    }
  }
`;
