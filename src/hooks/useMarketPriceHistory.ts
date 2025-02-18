import { useEffect, useState } from 'react';
import { request, gql } from 'graphql-request';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || '';

interface PriceSnapshot {
  timestamp: number;
  priceA: number;
  priceB: number;
  totalPoolA: string;
  totalPoolB: string;
}

const PRICE_HISTORY_QUERY = gql`
  query GetMarketPriceHistory($marketId: ID!, $startTime: BigInt!) {
    priceSnapshots(
      where: {
        market: $marketId,
        timestamp_gte: $startTime
      }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      priceA
      priceB
      totalPoolA
      totalPoolB
    }
  }
`;

export function useMarketPriceHistory(marketId: string | undefined, timeRange: number = 24 * 60 * 60) {
  const [priceHistory, setPriceHistory] = useState<PriceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!marketId || !SUBGRAPH_URL) return;

      try {
        const startTime = Math.floor(Date.now() / 1000) - timeRange;
        const { priceSnapshots } = await request(SUBGRAPH_URL, PRICE_HISTORY_QUERY, {
          marketId,
          startTime: startTime.toString()
        });

        setPriceHistory(
          priceSnapshots.map((snapshot: any) => ({
            timestamp: Number(snapshot.timestamp),
            priceA: Number(snapshot.priceA),
            priceB: Number(snapshot.priceB),
            totalPoolA: snapshot.totalPoolA,
            totalPoolB: snapshot.totalPoolB
          }))
        );
        setError(null);
      } catch (err) {
        console.error('Error fetching price history:', err);
        setError('Failed to load price history');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchPriceHistory();

    // Set up polling for updates
    const interval = setInterval(fetchPriceHistory, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, [marketId, timeRange]);

  return { priceHistory, loading, error };
} 