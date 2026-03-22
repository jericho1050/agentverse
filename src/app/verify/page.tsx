'use client';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShieldCheck,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Upload,
  Check,
  Hash,
  Sparkles
} from 'lucide-react';
import type { VerificationEvent } from '@/types';

const SAMPLE_LAB = `COMPLETE BLOOD COUNT (CBC)
Patient: Jane Doe | DOB: 1985-03-15 | Date: 2026-03-18
Ordering Physician: Dr. Smith, Internal Medicine

Test               Result    Unit       Reference Range    Flag
White Blood Cells  7.2       10^3/uL    4.5-11.0          Normal
Red Blood Cells    4.8       10^6/uL    4.2-5.4           Normal
Hemoglobin         14.2      g/dL       12.0-16.0         Normal
Hematocrit         42.1      %          36.0-46.0         Normal
Platelet Count     245       10^3/uL    150-400           Normal
MCV                87.7      fL         80.0-100.0        Normal
MCH                29.6      pg         27.0-33.0         Normal
MCHC               33.7      g/dL       32.0-36.0         Normal

Notes: All values within normal limits. No further action required.
Verified by: Lab Director, City Medical Lab
CLIA#: 12D3456789`;

const SAMPLE_PRESCRIPTION = `PRESCRIPTION
Date: 2026-03-15
Patient: John Smith | DOB: 1990-07-22
Prescriber: Dr. Sarah Johnson, MD | DEA#: BJ1234567
NPI: 1234567890

Rx: Amoxicillin 500mg capsules
Sig: Take 1 capsule by mouth 3 times daily for 10 days
Qty: 30 (thirty) capsules
Refills: 0 (zero)

Diagnosis: Acute bacterial sinusitis (J01.90)
Allergies: NKDA

Signature: [Dr. Sarah Johnson, MD]
Phone: (555) 123-4567`;

const SAMPLE_DIAGNOSIS = `MEDICAL DIAGNOSIS SUMMARY
Patient: Michael Chen | DOB: 1978-11-30 | Date: 2026-03-20
Provider: Dr. Emily Rodriguez, MD - Cardiology

Chief Complaint: Chest discomfort on exertion

Assessment:
- Stable angina pectoris (I20.8)
- Hypertension, uncontrolled (I10)
- Hyperlipidemia (E78.5)

Diagnostic Tests Performed:
- ECG: ST-segment depression during stress test
- Lipid Panel: Total cholesterol 245 mg/dL, LDL 165 mg/dL
- Blood Pressure: 152/94 mmHg

Treatment Plan:
1. Start Atorvastatin 40mg daily
2. Increase Lisinopril to 20mg daily
3. Nitroglycerin SL PRN for chest pain
4. Refer to cardiac catheterization
5. Lifestyle modifications: low-sodium diet, exercise program

Follow-up: 2 weeks

Provider Signature: Dr. Emily Rodriguez, MD
License: MD-12345-NY`;

export default function VerifyPage() {
  const [documentText, setDocumentText] = useState('');
  const [events, setEvents] = useState<VerificationEvent[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const startVerification = useCallback(async () => {
    if (!documentText.trim()) return;

    setEvents([]);
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText }),
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
              const event: VerificationEvent = JSON.parse(line.slice(6));
              setEvents(prev => [...prev, event]);
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [documentText]);

  const loadSample = (sample: string) => {
    setDocumentText(sample);
    setEvents([]);
    setError(null);
  };

  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completionEvent = events.find(e => e.type === 'verification_complete');
  const shareLink = completionEvent?.data?.shareLink as string | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
            Verify Document
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          AI-powered medical record verification with blockchain proof
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Input */}
        <Card className="bg-gray-900/50 border-white/[0.08]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-white">Document Input</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sample Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadSample(SAMPLE_LAB)}
                className="text-xs bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
              >
                Sample Lab Results
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadSample(SAMPLE_PRESCRIPTION)}
                className="text-xs bg-teal-500/5 border-teal-500/20 text-teal-400 hover:bg-teal-500/10"
              >
                Sample Prescription
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadSample(SAMPLE_DIAGNOSIS)}
                className="text-xs bg-cyan-500/5 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
              >
                Sample Diagnosis
              </Button>
            </div>

            {/* File Upload */}
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-500/30 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Upload .txt, .pdf, or .csv file</span>
                <input
                  type="file"
                  accept=".txt,.pdf,.csv,.doc,.docx"
                  className="hidden"
                  disabled={isVerifying}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // Use server-side parsing for PDF support
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const res = await fetch('/api/parse-file', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.text) {
                        setDocumentText(data.text);
                      } else {
                        alert(data.error || 'Could not read file. Please paste text manually.');
                      }
                    } catch {
                      // Fallback to direct text read for .txt files
                      const text = await file.text();
                      setDocumentText(text);
                    }
                  }}
                />
              </label>
            </div>

            {/* Textarea */}
            <Textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste medical document text here, or upload a file above..."
              className="min-h-[400px] bg-gray-800/50 border-white/[0.08] text-gray-200 font-[family-name:var(--font-jetbrains)] text-sm resize-none focus:border-emerald-500/30"
              disabled={isVerifying}
            />

            {/* Verify Button */}
            <Button
              onClick={startVerification}
              disabled={!documentText.trim() || isVerifying}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Verify Document
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Progress */}
        <Card className="bg-gray-900/50 border-white/[0.08]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-white">Verification Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShieldCheck className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-gray-500">Start verification to see progress</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, i) => (
                  <VerificationStep
                    key={i}
                    event={event}
                    isLast={i === events.length - 1}
                  />
                ))}

                {shareLink && (
                  <div className="mt-6 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-sm font-medium text-emerald-400 mb-2">Share Verification Proof</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-gray-800/50 px-3 py-2 rounded text-gray-300 truncate font-[family-name:var(--font-jetbrains)]">
                        {shareLink}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyShareLink(shareLink)}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface VerificationStepProps {
  event: VerificationEvent;
  isLast: boolean;
}

function VerificationStep({ event, isLast }: VerificationStepProps) {
  const stepConfig = {
    upload_received: { icon: FileText, color: 'emerald', label: 'Document Received' },
    analysis_started: { icon: Loader2, color: 'teal', label: 'AI Analyzing' },
    analysis_complete: { icon: CheckCircle2, color: 'emerald', label: 'Analysis Complete' },
    hcs_stamped: { icon: Hash, color: 'cyan', label: 'Blockchain Stamped' },
    token_minted: { icon: Sparkles, color: 'emerald', label: 'Token Minted' },
    verification_complete: { icon: ShieldCheck, color: 'emerald', label: 'Verification Complete' },
  };

  const config = stepConfig[event.type] || { icon: CheckCircle2, color: 'emerald', label: 'Step' };
  const Icon = config.icon;

  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    teal: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  };

  const analysis = event.data?.analysis as { score?: number; summary?: string; findings?: string[] } | undefined;

  return (
    <div className={`relative ${!isLast ? 'pb-6' : ''}`}>
      {/* Connecting line */}
      {!isLast && (
        <div className="absolute left-5 top-11 w-[2px] h-full bg-gradient-to-b from-emerald-500/30 to-transparent" />
      )}

      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center relative z-10 ${colorClasses[config.color as keyof typeof colorClasses]}`}>
          <Icon className={`w-5 h-5 ${event.type === 'analysis_started' ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-800/50 border-white/[0.08] text-gray-300 text-xs">
              Step {event.step}
            </Badge>
            <span className="text-sm font-semibold text-white">{config.label}</span>
          </div>
          <p className="text-sm text-gray-400">{event.content}</p>

          {/* Analysis details */}
          {analysis && (
            <div className="mt-3 space-y-3 p-4 rounded-lg bg-gray-800/30 border border-white/[0.06]">
              {analysis.score !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">Verification Score</span>
                    <span className="text-sm font-bold text-emerald-400">{analysis.score}%</span>
                  </div>
                  <Progress value={analysis.score} className="h-2 bg-gray-800" />
                </div>
              )}
              {analysis.summary && (
                <div>
                  <span className="text-xs font-medium text-gray-400 block mb-1">Summary</span>
                  <p className="text-xs text-gray-300">{analysis.summary}</p>
                </div>
              )}
              {analysis.findings && analysis.findings.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-400 block mb-2">Findings</span>
                  <ul className="space-y-1">
                    {analysis.findings.map((finding, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* HashScan link */}
          {event.hashScanLink && (
            <a
              href={event.hashScanLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View on HashScan
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
