import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck,
  ExternalLink,
  Calendar,
  Hash,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Coins,
} from 'lucide-react';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;

  // Fetch verification data from API
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/share/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return <NotFound />;
  }

  const verification = await res.json();

  const score = verification.overallScore ?? 0;
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Excellent' };
    if (score >= 50) return { text: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Fair' };
    return { text: 'text-red-400', bg: 'bg-red-500', label: 'Poor' };
  };

  const scoreColors = getScoreColor(score);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span className="text-lg font-semibold text-emerald-400">
              Verified by MediVerify
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              Medical Document Verification
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            This document has been verified on the Hedera blockchain
          </p>
        </div>

        {/* Score Card */}
        <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/5 border-emerald-500/20 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl" />
          <CardContent className="relative z-10 py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">Verification Score</p>
                <div className="flex items-baseline gap-3">
                  <span className={`text-6xl font-bold ${scoreColors.text}`}>{score}</span>
                  <span className="text-2xl text-gray-500">/100</span>
                </div>
                <Badge className="mt-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {scoreColors.label}
                </Badge>
              </div>
              <div className="w-32 h-32 rounded-full border-8 border-gray-800 relative">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className={scoreColors.text}
                    strokeDasharray={`${(score / 100) * 352} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className={`w-12 h-12 ${scoreColors.text}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary */}
          <Card className="bg-gray-900/50 border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-lg text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm leading-relaxed">
                {verification.summary || 'No summary available.'}
              </p>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="bg-gray-900/50 border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-lg text-white">Verification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">Verified on:</span>
                <span className="text-gray-200 font-medium">
                  {new Date(verification.verifiedAt).toLocaleDateString()}
                </span>
              </div>
              <Separator className="bg-white/[0.08]" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-400">C</span>
                </div>
                <span className="text-gray-400">Completeness:</span>
                <span className="text-gray-200 font-medium">
                  {verification.completenessScore}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-teal-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-teal-400">C</span>
                </div>
                <span className="text-gray-400">Consistency:</span>
                <span className="text-gray-200 font-medium">
                  {verification.consistencyScore}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Findings */}
        {verification.findings && verification.findings.length > 0 && (
          <Card className="bg-gray-900/50 border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-lg text-white">Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verification.findings.map((finding: { severity: string; description: string; suggestion?: string }, i: number) => {
                  const FindingIcon = finding.severity === 'critical' ? AlertCircle
                    : finding.severity === 'warning' ? AlertTriangle
                    : CheckCircle2;
                  const findingColor = finding.severity === 'critical' ? 'text-red-400'
                    : finding.severity === 'warning' ? 'text-yellow-400'
                    : 'text-emerald-400';

                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-white/[0.06]">
                      <FindingIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${findingColor}`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-200">{finding.description}</p>
                        {finding.suggestion && (
                          <p className="text-xs text-gray-500 mt-1">{finding.suggestion}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Red Flags */}
        {verification.redFlags && verification.redFlags.length > 0 && (
          <Card className="bg-red-500/5 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {verification.redFlags.map((flag: string, i: number) => (
                  <li key={i} className="text-sm text-red-400 flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-1">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Blockchain Proof */}
        <Card className="bg-gray-900/50 border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-emerald-400" />
              Blockchain Proof
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Document Hash (SHA-256)</p>
              <code className="block text-xs bg-gray-800/50 px-4 py-3 rounded text-gray-300 font-[family-name:var(--font-jetbrains)] break-all">
                {verification.documentHash}
              </code>
            </div>

            {verification.hcsTxId && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Hedera Consensus Service Transaction</p>
                <a
                  href={verification.hashScanLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span className="font-[family-name:var(--font-jetbrains)]">{verification.hcsTxId}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {verification.mvtTxId && (
              <div>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  MediVerify Token (MVT)
                </p>
                <code className="block text-xs bg-gray-800/50 px-4 py-3 rounded text-gray-300 font-[family-name:var(--font-jetbrains)]">
                  {verification.mvtTxId}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-white/[0.08]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
              <div className="w-2 h-0.5 bg-emerald-400 absolute" />
              <div className="w-0.5 h-2 bg-emerald-400 absolute" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              MediVerify
            </span>
          </div>
          <p className="text-xs text-gray-500">
            AI-powered medical record verification on Hedera blockchain
          </p>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-gray-700 mx-auto" />
        <h1 className="text-2xl font-bold text-white">Verification Not Found</h1>
        <p className="text-gray-500">This verification link is invalid or has expired.</p>
      </div>
    </div>
  );
}
