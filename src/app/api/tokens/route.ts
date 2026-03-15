import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { store } from '@/lib/store';

export async function GET() {
  const agents = store.getAgents();

  // Fetch balances from Mirror Node for each agent
  const balances = await Promise.all(
    agents.map(async (agent) => {
      let hbarBalance = 0;
      let avtBalance = 0;

      try {
        if (agent.accountId) {
          const response = await fetch(
            `${config.mirrorNode.url}/accounts/${agent.accountId}`
          );
          if (response.ok) {
            const data = await response.json();
            hbarBalance = (data.balance?.balance || 0) / 1e8; // tinybars to HBAR
          }
        }

        if (agent.accountId && config.tokens.avt) {
          const response = await fetch(
            `${config.mirrorNode.url}/accounts/${agent.accountId}/tokens?token.id=${config.tokens.avt}`
          );
          if (response.ok) {
            const data = await response.json();
            const tokenEntry = data.tokens?.[0];
            avtBalance = tokenEntry ? tokenEntry.balance / 100 : 0; // 2 decimals
          }
        }
      } catch {
        // Mirror Node may be slow, return 0 balances
      }

      return {
        agentId: agent.agentId,
        accountId: agent.accountId,
        hbarBalance,
        avtBalance,
      };
    })
  );

  return NextResponse.json({ balances });
}
