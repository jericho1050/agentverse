'use client';
import useSWR from 'swr';
import type { AgentBalance } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useBalances() {
  const { data, error, isLoading, mutate } = useSWR<{ balances: AgentBalance[] }>(
    '/api/tokens',
    fetcher,
    { refreshInterval: 15000 }
  );
  return {
    balances: data?.balances ?? [],
    isLoading,
    error,
    refreshBalances: mutate,
  };
}
