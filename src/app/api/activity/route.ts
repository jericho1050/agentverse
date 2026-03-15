import { config } from '@/lib/config';
import { store } from '@/lib/store';

// Track last seen sequence numbers per topic
const lastSequences: Record<string, number> = {};

async function fetchNewMessages(topicId: string): Promise<Array<Record<string, unknown>>> {
  const afterSeq = lastSequences[topicId] || 0;
  try {
    const url = `${config.mirrorNode.url}/topics/${topicId}/messages?sequencenumber=gt:${afterSeq}&limit=10&order=asc`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const messages = data.messages || [];
    if (messages.length > 0) {
      lastSequences[topicId] = messages[messages.length - 1].sequence_number;
    }
    return messages.map((msg: Record<string, unknown>) => {
      let content: Record<string, unknown> = {};
      try {
        content = JSON.parse(atob(msg.message as string));
      } catch {
        content = { raw: msg.message };
      }
      return {
        topicId,
        sequenceNumber: msg.sequence_number,
        timestamp: msg.consensus_timestamp,
        content,
      };
    });
  } catch {
    return [];
  }
}

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial activity from store
      const recent = store.getRecentActivity(20);
      for (const event of recent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      // Poll Mirror Node every 5 seconds
      const topicIds = [
        config.topics.registry,
        config.topics.negotiation,
        config.topics.reputation,
      ].filter(Boolean) as string[];

      const interval = setInterval(async () => {
        for (const topicId of topicIds) {
          const messages = await fetchNewMessages(topicId);
          for (const msg of messages) {
            const event = {
              type: 'hcs_message',
              agentName: (msg.content as Record<string, unknown>)?.agentName || 'Unknown',
              content: JSON.stringify(msg.content).slice(0, 200),
              hashScanLink: `https://hashscan.io/testnet/topic/${topicId}`,
              timestamp: Date.now(),
              topicId,
              sequenceNumber: msg.sequenceNumber as number,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
        }
      }, 5000);

      // Cleanup on abort
      const abortHandler = () => {
        clearInterval(interval);
        controller.close();
      };

      // Keep reference for cleanup
      (controller as unknown as Record<string, unknown>).__cleanup = abortHandler;
    },
    cancel() {
      // Stream was cancelled by client
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
