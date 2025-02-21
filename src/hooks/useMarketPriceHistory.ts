import { useQuery } from '@apollo/client';
import { GET_MARKET } from '@/graphql/queries';

export interface PriceSnapshot {
  timestamp: number;
  priceA: number;
  priceB: number;
  totalPoolA: string;
  totalPoolB: string;
}

export function useMarketPriceHistory(marketId: string | undefined) {
  const { data, loading, error } = useQuery(GET_MARKET, {
    variables: { id: marketId },
    skip: !marketId,
    pollInterval: 30000 // Poll every 30 seconds
  });

  const transformedHistory = data?.market?.priceHistory?.map((snapshot: any) => ({
    timestamp: Number(snapshot.timestamp),
    priceA: Number(snapshot.priceA),
    priceB: Number(snapshot.priceB),
    totalPoolA: snapshot.totalPoolA,
    totalPoolB: snapshot.totalPoolB
  })) || [];

  return {
    priceHistory: transformedHistory,
    loading,
    error: error?.message
  };
}
