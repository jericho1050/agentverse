'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, ExternalLink } from 'lucide-react';

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
  hcs_message: 'bg-sky-500/10 text-sky-400 border-0',
  registration: 'bg-emerald-500/10 text-emerald-400 border-0',
  request: 'bg-violet-500/10 text-violet-400 border-0',
  offer: 'bg-amber-500/10 text-amber-400 border-0',
  acceptance: 'bg-cyan-500/10 text-cyan-400 border-0',
  delivery: 'bg-teal-500/10 text-teal-400 border-0',
  rating: 'bg-orange-500/10 text-orange-400 border-0',
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
          <h1 className="text-3xl font-bold text-white flex items-center">
            Activity Feed
            <Radio className="w-5 h-5 text-emerald-400 inline ml-2" />
          </h1>
          <p className="text-gray-400 mt-1">Real-time HCS messages from the Hedera network</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.5)]'}`}></span>
          <span className={`text-xs ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <Card
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-400 font-medium tabular-nums">
            {events.length} events {isPaused && '(paused)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={scrollRef} className="space-y-2 max-h-[70vh] overflow-y-auto">
            {events.length === 0 ? (
              <div className="bg-white/[0.02] rounded-2xl border border-dashed border-white/[0.06] py-12">
                <p className="text-gray-500 text-sm text-center">
                  No activity yet. Start a negotiation on the Marketplace page to see live events.
                </p>
              </div>
            ) : (
              events.map((event, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-200">
                  <Badge className={typeColors[event.type] || 'bg-white/[0.06] text-gray-400 border-0'} variant="secondary">
                    {event.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium text-gray-100">{event.agentName}</span>
                      <span className="text-gray-400 ml-2">{event.content.slice(0, 150)}</span>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.hashScanLink && (
                        <a href={event.hashScanLink} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                          HashScan
                          <ExternalLink className="w-3 h-3" />
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
