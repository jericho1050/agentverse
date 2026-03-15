import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

// Initialize store with default agents on first request
let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    store.seedDefaultAgents();
    initialized = true;
  }
}

export async function GET() {
  ensureInitialized();
  const agents = store.getAgents();
  return NextResponse.json({ agents, total: agents.length });
}

export async function POST(request: Request) {
  ensureInitialized();
  try {
    const body = await request.json();
    // For now, just add to store (later: publish to HCS)
    store.addAgent({
      agentId: body.agentId || crypto.randomUUID(),
      name: body.name,
      capabilities: body.capabilities,
      description: body.description,
      pricing: body.pricing || { currency: 'HBAR', basePrice: 0.5, unit: 'per-task' },
      accountId: body.accountId || '',
      evmAddress: body.evmAddress || '',
      reputationScore: 0,
      totalJobs: 0,
      isOnline: true,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register agent' },
      { status: 500 }
    );
  }
}
