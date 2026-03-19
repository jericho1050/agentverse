import { runVerification } from '@/lib/agents/orchestrator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentText, documentType } = body;

    if (!documentText || typeof documentText !== 'string' || documentText.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Document text is required (minimum 10 characters)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of runVerification({
            documentText: documentText.trim(),
            documentType,
          })) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        } catch (error) {
          const errorEvent = {
            step: 0,
            type: 'verification_complete',
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
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to start verification' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
