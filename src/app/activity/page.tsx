'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActivityEvent {
  type: string;
  agentName: string;
  content: string;
  hashScanLink?: string;
  timestamp: number;
  topicId?: string;
  sequenceNumber?: number;
}

const typeColors: Record<string, string> = {
  hcs_message: 'bg-blue-500/10 text-blue-400',
  registration: 'bg-green-500/10 text-green-400',
  request: 'bg-purple-500/10 text-purple-400',
  offer: 'bg-yellow-500/10 text-yellow-400',
  acceptance: 'bg-cyan-500/10 text-cyan-400',
  delivery: 'bg-emerald-500/10 text-emerald-400',
  rating: 'bg-orange-500/10 text-orange-400',
};

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource('/api/activity');

    es.onopen = () => setIsConnected(true);
    es.onerror = () => setIsConnected(false);
    es.onmessage = (e) => {
      try {
        const event: ActivityEvent = JSON.parse(e.data);
        setEvents(prev => [event, ...prev].slice(0, 100));
      } catch { /* skip malformed */ }
    };

    return () => es.close();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Feed</h1>
          <p className="text-gray-400 mt-1">Real-time HCS messages from the Hedera network</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <Card
        className="bg-gray-900 border-gray-800"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-400">
            {events.length} events {isPaused && '(paused)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={scrollRef} className="space-y-2 max-h-[70vh] overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">
                No activity yet. Start a negotiation on the Marketplace page to see live events.
              </p>
            ) : (
              events.map((event, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                  <Badge className={typeColors[event.type] || 'bg-gray-700 text-gray-300'} variant="secondary">
                    {event.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium text-gray-200">{event.agentName}</span>
                      <span className="text-gray-400 ml-2">{event.content.slice(0, 150)}</span>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-600">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.hashScanLink && (
                        <a href={event.hashScanLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                          HashScan →
                        </a>
                      )}
                    </div>
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
