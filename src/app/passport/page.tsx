'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  ExternalLink,
  FileCheck,
  TrendingUp,
  Coins,
  Share2,
  Check,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import type { MedicalDocument } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PassportPage() {
  const { data, isLoading } = useSWR<{ documents: MedicalDocument[]; total: number }>('/api/documents', fetcher);
  const [copied, setCopied] = useState(false);

  const documents = data?.documents?.filter(d => d.status === 'verified' && d.verification) || [];
  const verifiedCount = documents.length;
  const averageScore = verifiedCount > 0
    ? Math.round(documents.reduce((sum, d) => sum + (d.verification?.overallScore ?? 0), 0) / verifiedCount)
    : 0;
  const totalOnChain = documents.filter(d => d.verification?.hcsTxId).length;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/passport');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeLabels: Record<string, string> = {
    lab_result: 'Lab Result',
    prescription: 'Prescription',
    diagnosis: 'Diagnosis',
    imaging: 'Imaging',
    vaccination: 'Vaccination',
    other: 'Other',
  };

  const typeColors: Record<string, { badge: string; dot: string }> = {
    lab_result: { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', dot: 'bg-cyan-400' },
    prescription: { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
    diagnosis: { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
    imaging: { badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20', dot: 'bg-pink-400' },
    vaccination: { badge: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-400' },
    other: { badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', dot: 'bg-gray-400' },
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
            Health Passport
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          Your verified medical identity on the blockchain
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-80 w-full bg-gray-800/50 rounded-2xl" />
          <Skeleton className="h-96 w-full bg-gray-800/50 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Passport Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30 border-emerald-500/20">
            {/* Decorative medical cross watermark */}
            <div className="absolute right-0 top-0 w-96 h-96 opacity-[0.02] pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-16 bg-emerald-400 absolute" />
                <div className="w-16 h-48 bg-emerald-400 absolute" />
              </div>
            </div>

            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 opacity-40 blur-xl" />

            {/* Subtle scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />

            <CardContent className="relative z-10 p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                {/* Left: Circular Health Score */}
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48">
                    {/* Background circle */}
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-gray-800"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(averageScore / 100) * 534} 534`}
                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="50%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-6xl font-bold text-white font-[family-name:var(--font-outfit)]">
                        {averageScore}
                      </div>
                      <div className="text-sm text-gray-400 font-medium tracking-wider uppercase mt-1">
                        Health Score
                      </div>
                    </div>

                    {/* Pulse ring */}
                    {averageScore > 0 && (
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" style={{ animationDuration: '3s' }} />
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="mt-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                    <span className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">
                      Verified Identity
                    </span>
                  </div>
                </div>

                {/* Right: Stats Grid */}
                <div className="flex-1 grid grid-cols-3 gap-6">
                  <StatPill
                    icon={FileCheck}
                    label="Total Records"
                    value={verifiedCount}
                    color="emerald"
                  />
                  <StatPill
                    icon={TrendingUp}
                    label="Avg Score"
                    value={`${averageScore}%`}
                    color="teal"
                  />
                  <StatPill
                    icon={Coins}
                    label="On-Chain"
                    value={totalOnChain}
                    color="cyan"
                  />

                  {/* Passport info */}
                  <div className="col-span-3 mt-4 p-6 rounded-xl bg-black/20 border border-white/[0.05]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Passport ID
                        </span>
                        <code className="text-xs text-gray-400 font-[family-name:var(--font-jetbrains)]">
                          MVP-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Issued
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Network
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                          <span className="text-xs text-emerald-400 font-semibold">
                            Hedera Testnet
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)]">
                Verified Records
              </h2>
              <span className="text-sm text-gray-500">
                {verifiedCount} {verifiedCount === 1 ? 'document' : 'documents'}
              </span>
            </div>

            {documents.length === 0 ? (
              <Card className="bg-gray-900/50 border-white/[0.08]">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Shield className="w-16 h-16 text-gray-700 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No verified records yet</h3>
                  <p className="text-gray-500 mb-6">Upload and verify your first medical document</p>
                  <a href="/verify">
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20">
                      <Shield className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent" />

                <div className="space-y-4">
                  {documents.map((doc) => {
                    const verification = doc.verification!;
                    const score = verification.overallScore;
                    const colors = typeColors[doc.type] || typeColors.other;

                    return (
                      <div key={doc.id} className="relative pl-16">
                        {/* Timeline dot */}
                        <div className={`absolute left-[18px] top-8 w-4 h-4 rounded-full ${colors.dot} border-4 border-gray-950 shadow-lg`} style={{ boxShadow: `0 0 12px ${colors.dot}` }} />

                        <Card className="bg-gray-900/50 border-white/[0.08] hover:border-emerald-500/20 transition-all duration-300 group">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-6">
                              {/* Left: Document info */}
                              <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`text-xs ${colors.badge}`}>
                                      {typeLabels[doc.type]}
                                    </Badge>
                                    {verification.redFlags && verification.redFlags.length > 0 && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                                        <AlertCircle className="w-3 h-3 text-red-400" />
                                        <span className="text-xs text-red-400 font-medium">
                                          {verification.redFlags.length} {verification.redFlags.length === 1 ? 'flag' : 'flags'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                    {doc.title}
                                  </h3>
                                </div>

                                {/* Summary snippet */}
                                {verification.summary && (
                                  <p className="text-sm text-gray-400 line-clamp-2">
                                    {verification.summary}
                                  </p>
                                )}

                                {/* Score bar */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                      Verification Score
                                    </span>
                                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                                      {score}%
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-1000 rounded-full ${
                                        score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                        score >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                        'bg-gradient-to-r from-red-500 to-pink-500'
                                      }`}
                                      style={{ width: `${score}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Footer metadata */}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                      {new Date(verification.verifiedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  {verification.hcsSequence && (
                                    <div className="flex items-center gap-1.5">
                                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                      <span className="text-emerald-400 font-medium">
                                        HCS #{verification.hcsSequence}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right: Score badge */}
                              <div className="flex flex-col items-end gap-3">
                                <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center ${
                                  score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' :
                                  score >= 50 ? 'bg-yellow-500/10 border-yellow-500/30' :
                                  'bg-red-500/10 border-red-500/30'
                                }`}>
                                  <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                                    {score}
                                  </span>
                                </div>

                                {/* HashScan link */}
                                {verification.hashScanLink && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => window.open(verification.hashScanLink, '_blank')}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    HashScan
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom: Share + Powered by Hedera */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Powered by Hedera</p>
                <p className="text-xs text-gray-500">Immutable blockchain verification</p>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 group"
              onClick={handleShare}
              disabled={verifiedCount === 0}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Share Passport
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

interface StatPillProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: 'emerald' | 'teal' | 'cyan';
}

function StatPill({ icon: Icon, label, value, color }: StatPillProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    teal: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  };

  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className={`w-14 h-14 rounded-2xl ${colorClasses[color]} border flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-3xl font-bold text-white font-[family-name:var(--font-outfit)]">
          {value}
        </div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}
