'use client';
import { useAgents } from './use-agents';
import { useTransactions } from './use-transactions';

export function useDashboardStats() {
  const { agents, isLoading: agentsLoading } = useAgents();
  const { transactions, isLoading: txLoading } = useTransactions();

  const totalAvtVolume = transactions.reduce((sum, tx) => sum + (tx.avtReward ?? 0), 0);
  const activeNegotiations = transactions.filter(tx => tx.status === 'in_progress').length;

  return {
    totalAgents: agents.length,
    totalTransactions: transactions.length,
    activeNegotiations,
    totalAvtVolume,
    isLoading: agentsLoading || txLoading,
  };
}
