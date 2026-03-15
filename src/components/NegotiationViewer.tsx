'use client';
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NegotiationEvent } from '@/types';
import { ClipboardList, MessageSquare, Handshake, Lock, Zap, RefreshCw, CheckCircle2, Package, Search, Coins, Star, PartyPopper, Store } from 'lucide-react';

interface NegotiationViewerProps {
  events: NegotiationEvent[];
  isRunning: boolean;
}

const stepConfig: Record<string, { color: string; icon: React.ComponentType<{className?: string}>; bg: string }> = {
  request_submitted: { color: 'text-sky-400', icon: ClipboardList, bg: 'border-l-sky-500' },
  offer_received: { color: 'text-emerald-400', icon: MessageSquare, bg: 'border-l-emerald-500' },
  offer_accepted: { color: 'text-amber-400', icon: Handshake, bg: 'border-l-amber-500' },
  escrow_created: { color: 'text-violet-400', icon: Lock, bg: 'border-l-violet-500' },
  work_started: { color: 'text-cyan-400', icon: Zap, bg: 'border-l-cyan-500' },
  progress_update: { color: 'text-cyan-300', icon: RefreshCw, bg: 'border-l-cyan-400' },
  work_completed: { color: 'text-emerald-400', icon: CheckCircle2, bg: 'border-l-emerald-500' },
  delivery_submitted: { color: 'text-teal-400', icon: Package, bg: 'border-l-teal-500' },
  verification_started: { color: 'text-indigo-400', icon: Search, bg: 'border-l-indigo-500' },
  payment_released: { color: 'text-amber-400', icon: Coins, bg: 'border-l-amber-500' },
  rating_submitted: { color: 'text-orange-400', icon: Star, bg: 'border-l-orange-500' },
  negotiation_complete: { color: 'text-emerald-300', icon: PartyPopper, bg: 'border-l-emerald-400' },
};

export function NegotiationViewer({ events, isRunning }: NegotiationViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">Negotiation Flow</CardTitle>
          {isRunning && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
          {events.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-dashed border-white/[0.06]">
              <Store className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">Select a service and click &quot;Start Negotiation&quot;</p>
              <p className="text-gray-600 text-sm mt-1">Watch AI agents negotiate and transact in real-time</p>
            </div>
          ) : (
            events.map((event, i) => {
              const config = stepConfig[event.type] || { color: 'text-gray-400', icon: ClipboardList, bg: 'border-l-gray-600' };
              const isComplete = event.type === 'negotiation_complete';
              const isWork = event.type === 'work_completed';
              const Icon = config.icon;

              return (
                <div
                  key={i}
                  className={`border-l-2 ${config.bg} pl-4 py-2 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-all duration-200 animate-in fade-in slide-in-from-left-2`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${config.color}`}>
                          {event.agentName}
                        </span>
                        <Badge variant="secondary" className="text-[10px] bg-white/[0.06] text-gray-400 border-0">
                          Step {event.step}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{event.content}</p>

                      {isWork && event.data && (
                        <pre className="mt-2 p-3 bg-white/[0.02] border-white/[0.06] rounded-xl font-mono text-xs text-gray-400 overflow-auto max-h-60 border">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      )}

                      {event.hashScanLink && (
                        <a
                          href={event.hashScanLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-400 hover:text-emerald-300 mt-1 inline-block"
                        >
                          Verify on HashScan →
                        </a>
                      )}

                      {isComplete && event.data && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border-emerald-500/15 border">
                          <div className="text-sm font-medium text-emerald-400">Negotiation Complete</div>
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

          {isRunning && events.length > 0 && (
            <div className="border-l-2 border-l-emerald-500/30 pl-4 py-2 bg-white/[0.02] rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-sm text-emerald-400">Processing next step...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
