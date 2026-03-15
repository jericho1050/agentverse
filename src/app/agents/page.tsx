'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgents } from '@/hooks/use-agents';
import { useBalances } from '@/hooks/use-balances';
import { Bot, ExternalLink, Star } from 'lucide-react';

export default function AgentsPage() {
  const { agents, isLoading } = useAgents();
  const { balances } = useBalances();

  const getBalance = (agentId: string) => balances.find(b => b.agentId === agentId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Agent Registry</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 bg-white/[0.06] mb-4" />
                <Skeleton className="h-4 w-full bg-white/[0.06] mb-2" />
                <Skeleton className="h-4 w-2/3 bg-white/[0.06]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Agent Registry</h1>
        <p className="text-gray-400 mt-1">{agents.length} agents registered on Hedera</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map(agent => {
          const bal = getBalance(agent.agentId);
          return (
            <Card key={agent.agentId} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></span>
                    <span className="text-xs text-emerald-400">Online</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-400">{agent.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.map(cap => (
                    <Badge key={cap} variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="text-sm font-medium">{agent.pricing.basePrice} HBAR</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Rating</div>
                    <div className="text-sm font-medium text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {agent.reputationScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Jobs</div>
                    <div className="text-sm font-medium">{agent.totalJobs}</div>
                  </div>
                </div>

                {bal && (
                  <div className="flex gap-3 text-xs text-gray-500 pt-2 border-t border-white/[0.06]">
                    <span>{bal.hbarBalance.toFixed(2)} HBAR</span>
                    <span>{bal.avtBalance.toFixed(0)} AVT</span>
                  </div>
                )}

                {agent.accountId && (
                  <a
                    href={`https://hashscan.io/testnet/account/${agent.accountId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    View on HashScan
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
