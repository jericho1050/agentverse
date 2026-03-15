'use client';
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NegotiationEvent } from '@/types';

interface NegotiationViewerProps {
  events: NegotiationEvent[];
  isRunning: boolean;
}

const stepConfig: Record<string, { color: string; icon: string; bg: string }> = {
  request_submitted: { color: 'text-blue-400', icon: '📋', bg: 'border-l-blue-500' },
  offer_received: { color: 'text-green-400', icon: '💬', bg: 'border-l-green-500' },
  offer_accepted: { color: 'text-yellow-400', icon: '🤝', bg: 'border-l-yellow-500' },
  escrow_created: { color: 'text-purple-400', icon: '🔒', bg: 'border-l-purple-500' },
  work_started: { color: 'text-cyan-400', icon: '⚡', bg: 'border-l-cyan-500' },
  progress_update: { color: 'text-cyan-300', icon: '🔄', bg: 'border-l-cyan-400' },
  work_completed: { color: 'text-emerald-400', icon: '✅', bg: 'border-l-emerald-500' },
  delivery_submitted: { color: 'text-teal-400', icon: '📦', bg: 'border-l-teal-500' },
  verification_started: { color: 'text-indigo-400', icon: '🔍', bg: 'border-l-indigo-500' },
  payment_released: { color: 'text-amber-400', icon: '💰', bg: 'border-l-amber-500' },
  rating_submitted: { color: 'text-orange-400', icon: '⭐', bg: 'border-l-orange-500' },
  negotiation_complete: { color: 'text-green-300', icon: '🎉', bg: 'border-l-green-400' },
};

export function NegotiationViewer({ events, isRunning }: NegotiationViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <Card className="bg-gray-900 border-gray-800 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Negotiation Flow</CardTitle>
          {isRunning && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-xs text-blue-400">Live</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
          {events.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🏪</div>
              <p className="text-gray-500">Select a service and click &quot;Start Negotiation&quot;</p>
              <p className="text-gray-600 text-sm mt-1">Watch AI agents negotiate and transact in real-time</p>
            </div>
          ) : (
            events.map((event, i) => {
              const config = stepConfig[event.type] || { color: 'text-gray-400', icon: '📌', bg: 'border-l-gray-600' };
              const isComplete = event.type === 'negotiation_complete';
              const isWork = event.type === 'work_completed';

              return (
                <div
                  key={i}
                  className={`border-l-2 ${config.bg} pl-4 py-2 animate-in fade-in slide-in-from-left-2 duration-300`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${config.color}`}>
                          {event.agentName}
                        </span>
                        <Badge variant="secondary" className="text-[10px] bg-gray-800 text-gray-500">
                          Step {event.step}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{event.content}</p>

                      {/* Show service result for work_completed */}
                      {isWork && event.data && (
                        <pre className="mt-2 p-3 bg-gray-800 rounded-lg text-xs text-gray-400 overflow-auto max-h-60 border border-gray-700">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      )}

                      {/* HashScan link */}
                      {event.hashScanLink && (
                        <a
                          href={event.hashScanLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                        >
                          Verify on HashScan →
                        </a>
                      )}

                      {/* Completion summary */}
                      {isComplete && event.data && (
                        <div className="mt-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                          <div className="text-sm font-medium text-green-400">Negotiation Complete</div>
                          <div className="text-xs text-gray-400 mt-1 space-y-1">
                            {event.data.provider ? <div>Provider: {String(event.data.provider)}</div> : null}
                            {event.data.price ? <div>Price: {String(event.data.price)} HBAR</div> : null}
                            {event.data.rating ? <div>Rating: {String(event.data.rating)}/5</div> : null}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading indicator */}
          {isRunning && events.length > 0 && (
            <div className="border-l-2 border-l-blue-500/30 pl-4 py-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-sm text-blue-400">Processing next step...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
