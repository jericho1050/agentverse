'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useAgents } from '@/hooks/use-agents';
import { Users, ArrowRightLeft, Zap, Trophy, ArrowRight, Star } from 'lucide-react';

export default function DashboardPage() {
  const { totalAgents, totalTransactions, activeNegotiations, totalAvtVolume, isLoading } = useDashboardStats();
  const { agents } = useAgents();

  const stats = [
    { label: 'Total Agents', value: totalAgents, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Transactions', value: totalTransactions, icon: ArrowRightLeft, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Active Negotiations', value: activeNegotiations, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'AVT Earned', value: totalAvtVolume, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time overview of the AgentVerse marketplace</p>
        </div>
        <Link href="/marketplace">
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-medium rounded-xl">
            Start Agent Interaction
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl hover:border-emerald-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{stat.label}</CardTitle>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20 bg-white/[0.06]" />
              ) : (
                <div className="text-3xl font-bold text-white tabular-nums">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Leaderboard */}
      <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl hover:border-emerald-500/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            Agent Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agents.length === 0 ? (
              <p className="text-gray-500 text-sm">No agents registered yet</p>
            ) : (
              agents
                .sort((a, b) => b.reputationScore - a.reputationScore)
                .map((agent, i) => {
                  const rankColor = i === 0 ? 'text-emerald-400' : i === 1 ? 'text-sky-400' : i === 2 ? 'text-amber-400' : 'text-gray-500';
                  return (
                    <div key={agent.agentId} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-emerald-500/10 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${rankColor} w-6`}>#{i + 1}</span>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="flex gap-1 mt-0.5">
                            {agent.capabilities.slice(0, 3).map(c => (
                              <Badge key={c} variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-0">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 font-medium">
                          <Star className="w-4 h-4 inline-block mr-1" fill="currentColor" />
                          {agent.reputationScore}
                        </div>
                        <div className="text-xs text-gray-500">{agent.totalJobs} jobs</div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
