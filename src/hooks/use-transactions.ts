'use client';
import useSWR from 'swr';
import type { Transaction } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useTransactions() {
  const { data, error, isLoading, mutate } = useSWR<{ transactions: Transaction[]; total: number }>(
    '/api/transactions',
    fetcher
  );
  return {
    transactions: data?.transactions ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refreshTransactions: mutate,
  };
}
