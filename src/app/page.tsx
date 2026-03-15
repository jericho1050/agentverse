'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useAgents } from '@/hooks/use-agents';

export default function DashboardPage() {
  const { totalAgents, totalTransactions, activeNegotiations, totalAvtVolume, isLoading } = useDashboardStats();
  const { agents } = useAgents();

  const stats = [
    { label: 'Total Agents', value: totalAgents, icon: '🤖' },
    { label: 'Transactions', value: totalTransactions, icon: '💰' },
    { label: 'Active Negotiations', value: activeNegotiations, icon: '⚡' },
    { label: 'AVT Earned', value: totalAvtVolume, icon: '🏆' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time overview of the AgentVerse marketplace</p>
        </div>
        <Link href="/marketplace">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Start Agent Interaction
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{stat.label}</CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20 bg-gray-800" />
              ) : (
                <div className="text-3xl font-bold text-white">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Leaderboard */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Agent Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agents.length === 0 ? (
              <p className="text-gray-500 text-sm">No agents registered yet</p>
            ) : (
              agents
                .sort((a, b) => b.reputationScore - a.reputationScore)
                .map((agent, i) => (
                  <div key={agent.agentId} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-500 w-6">#{i + 1}</span>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="flex gap-1 mt-0.5">
                          {agent.capabilities.slice(0, 3).map(c => (
                            <Badge key={c} variant="secondary" className="text-[10px] bg-gray-700 text-gray-300">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-medium">★ {agent.reputationScore}</div>
                      <div className="text-xs text-gray-500">{agent.totalJobs} jobs</div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
