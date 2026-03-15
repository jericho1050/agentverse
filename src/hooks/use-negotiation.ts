'use client';
import { useState, useCallback } from 'react';
import type { NegotiationEvent } from '@/types';

interface NegotiationRequest {
  capability: string;
  description: string;
  budget: number;
  inputData: Record<string, unknown>;
}

export function useNegotiation() {
  const [events, setEvents] = useState<NegotiationEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startNegotiation = useCallback(async (request: NegotiationRequest) => {
    setEvents([]);
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: NegotiationEvent = JSON.parse(line.slice(6));
              setEvents(prev => [...prev, event]);
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Negotiation failed');
    } finally {
      setIsRunning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setEvents([]);
    setIsRunning(false);
    setError(null);
  }, []);

  return {
    events,
    isRunning,
    error,
    startNegotiation,
    reset,
  };
}
