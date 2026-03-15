import { getOrchestrator } from '@/lib/agents/orchestrator';
import { store } from '@/lib/store';

// Ensure store is initialized
let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    store.seedDefaultAgents();
    initialized = true;
  }
}

export async function POST(request: Request) {
  ensureInitialized();

  try {
    const body = await request.json();
    const { capability, description, budget, inputData } = body;

    const orchestrator = getOrchestrator();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of orchestrator.runNegotiation({
            capability: capability || 'code-review',
            description: description || 'Review this code',
            budget: budget || 0.5,
            inputData: inputData || {},
          })) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        } catch (error) {
          const errorEvent = {
            step: 0,
            type: 'negotiation_complete',
            agentId: 'platform',
            agentName: 'AgentVerse',
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: Date.now(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to start negotiation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
