'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ExternalLink, ShieldCheck, FileCheck } from 'lucide-react';
import type { ActivityEvent } from '@/types';

const typeColors: Record<string, string> = {
  verification: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  document_upload: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  analysis: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  hcs_stamp: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  token_mint: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              Activity Feed
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time verification events from Hedera Consensus Service
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-900/50 border border-white/[0.08]">
          <span className={`relative flex h-3 w-3 ${isConnected ? '' : 'opacity-50'}`}>
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
          </span>
          <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <Card
        className="bg-gray-900/50 border border-white/[0.08]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-white">
                Live Events {isPaused && <span className="text-sm text-gray-500 ml-2">(paused)</span>}
              </CardTitle>
            </div>
            <div className="text-sm text-gray-500 font-[family-name:var(--font-jetbrains)]">
              {events.length} events
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={scrollRef} className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl bg-gray-800/30 border border-dashed border-white/[0.08]">
                <Activity className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-gray-500 mb-2">No activity yet</p>
                <p className="text-sm text-gray-600">Verify a document to see live events</p>
              </div>
            ) : (
              events.map((event, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 border border-white/[0.05] hover:border-emerald-500/20 hover:bg-gray-800/50 transition-all duration-200"
                >
                  {/* Icon + Badge */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      {event.type.includes('verify') ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <FileCheck className="w-5 h-5 text-teal-400" />
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${typeColors[event.type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
                    >
                      {event.type}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 mb-2">{event.content}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-500 font-[family-name:var(--font-jetbrains)]">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.topicId && (
                        <span className="text-gray-600 font-[family-name:var(--font-jetbrains)]">
                          Topic: {event.topicId}
                        </span>
                      )}
                      {event.sequenceNumber && (
                        <span className="text-gray-600 font-[family-name:var(--font-jetbrains)]">
                          Seq: {event.sequenceNumber}
                        </span>
                      )}
                      {event.hashScanLink && (
                        <a
                          href={event.hashScanLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          HashScan
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 mt-1" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
