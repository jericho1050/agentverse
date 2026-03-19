'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Calendar,
  Hash,
} from 'lucide-react';
import type { MedicalDocument } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RecordsPage() {
  const { data: documents, isLoading } = useSWR<MedicalDocument[]>('/api/documents', fetcher);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
            My Records
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          View all verified medical documents
        </p>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 bg-gray-800/50 rounded-xl" />
          ))}
        </div>
      ) : !documents || documents.length === 0 ? (
        <Card className="bg-gray-900/50 border-white/[0.08]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-16 h-16 text-gray-700 mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No verified documents yet</h3>
            <p className="text-gray-500 mb-6">Verify your first document to get started</p>
            <a href="/verify">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verify Document
              </Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isExpanded={expandedId === doc.id}
              onToggle={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DocumentCardProps {
  document: MedicalDocument;
  isExpanded: boolean;
  onToggle: () => void;
}

function DocumentCard({ document, isExpanded, onToggle }: DocumentCardProps) {
  const verification = document.verification;
  const score = verification?.overallScore ?? 0;

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', progress: 'bg-emerald-500' };
    if (score >= 50) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', progress: 'bg-yellow-500' };
    return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', progress: 'bg-red-500' };
  };

  const scoreColors = getScoreColor(score);

  const typeLabels: Record<string, string> = {
    lab_result: 'Lab Result',
    prescription: 'Prescription',
    diagnosis: 'Diagnosis',
    imaging: 'Imaging',
    other: 'Other',
  };

  const typeColors: Record<string, string> = {
    lab_result: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    prescription: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    diagnosis: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    imaging: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <Card className={`bg-gray-900/50 border transition-all duration-300 hover:shadow-xl ${isExpanded ? scoreColors.border : 'border-white/[0.08] hover:border-emerald-500/20'}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Badge variant="outline" className={`text-xs ${typeColors[document.type]}`}>
              {typeLabels[document.type]}
            </Badge>
            <CardTitle className="text-base font-semibold text-white line-clamp-2">
              {document.title}
            </CardTitle>
          </div>
          {verification && (
            <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${scoreColors.bg} ${scoreColors.border}`}>
              <span className={`text-lg font-bold ${scoreColors.text}`}>{score}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Progress */}
        {verification && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Verification Score</span>
              <span className={`text-xs font-semibold ${scoreColors.text}`}>{score}%</span>
            </div>
            <Progress value={score} className="h-2 bg-gray-800">
              <div className={`h-full ${scoreColors.progress} transition-all`} style={{ width: `${score}%` }} />
            </Progress>
          </div>
        )}

        {/* Date & HashScan */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-3 h-3" />
            {new Date(document.uploadedAt).toLocaleDateString()}
          </div>
          {verification?.hashScanLink && (
            <a
              href={verification.hashScanLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              HashScan
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full text-gray-400 hover:text-white hover:bg-white/[0.05]"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              View Details
            </>
          )}
        </Button>

        {/* Expanded Details */}
        {isExpanded && verification && (
          <div className="space-y-4 pt-4 border-t border-white/[0.08]">
            {/* Summary */}
            {verification.summary && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Summary</h4>
                <p className="text-sm text-gray-300">{verification.summary}</p>
              </div>
            )}

            <Separator className="bg-white/[0.08]" />

            {/* Findings */}
            {verification.findings && verification.findings.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Findings</h4>
                <div className="space-y-2">
                  {verification.findings.map((finding, i) => {
                    const FindingIcon = finding.severity === 'critical' ? AlertCircle
                      : finding.severity === 'warning' ? AlertTriangle
                      : CheckCircle2;
                    const findingColor = finding.severity === 'critical' ? 'text-red-400'
                      : finding.severity === 'warning' ? 'text-yellow-400'
                      : 'text-emerald-400';

                    return (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <FindingIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${findingColor}`} />
                        <div className="flex-1">
                          <p className="text-gray-300">{finding.description}</p>
                          {finding.suggestion && (
                            <p className="text-gray-500 mt-1">{finding.suggestion}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {verification.redFlags && verification.redFlags.length > 0 && (
              <>
                <Separator className="bg-white/[0.08]" />
                <div>
                  <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Red Flags
                  </h4>
                  <ul className="space-y-1">
                    {verification.redFlags.map((flag, i) => (
                      <li key={i} className="text-xs text-red-400 flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator className="bg-white/[0.08]" />

            {/* Document Hash */}
            {verification.documentHash && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Document Hash
                </h4>
                <code className="text-xs text-gray-500 font-[family-name:var(--font-jetbrains)] break-all">
                  {verification.documentHash}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {verification.hashScanLink && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => window.open(verification.hashScanLink, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  HashScan
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-teal-500/5 border-teal-500/20 text-teal-400 hover:bg-teal-500/10"
                onClick={() => window.open(`/share/${verification.id}`, '_blank')}
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
