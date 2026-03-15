import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = store.getAgent(id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  return NextResponse.json({
    agent,
    reputation: {
      score: agent.reputationScore,
      totalRatings: agent.totalJobs,
    },
  });
}
