'use client';
import useSWR from 'swr';
import type { Agent } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useAgents() {
  const { data, error, isLoading, mutate } = useSWR<{ agents: Agent[]; total: number }>(
    '/api/agents',
    fetcher
  );
  return {
    agents: data?.agents ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refreshAgents: mutate,
  };
}
