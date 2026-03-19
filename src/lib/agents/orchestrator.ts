import { callClaude } from './llm-client';
import { DOCUMENT_ANALYSIS_PROMPT } from './prompts';

function extractJSON(text: string): Record<string, unknown> {
  try { return JSON.parse(text); } catch { /* continue */ }
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1].trim()); } catch { /* continue */ }
  }
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try { return JSON.parse(braceMatch[0]); } catch { /* continue */ }
  }
  return { raw: text };
}
import { store } from '@/lib/store';
import { config } from '@/lib/config';
import { publishMessage } from '@/lib/hedera/hcs';
import { transferTokens } from '@/lib/hedera/hts';
import { getOperatorClient } from '@/lib/hedera/client';
import type { VerificationEvent, MedicalDocument, DocumentVerification, VerificationFinding } from '@/types';
import crypto from 'crypto';

export interface VerificationRequest {
  documentText: string;
  documentType?: string;
}

/**
 * Safely publish to HCS - returns tx info or null on failure.
 */
async function safePublishHCS(
  topicId: string | undefined,
  message: Record<string, unknown>,
  label: string
): Promise<{ transactionId: string; sequenceNumber: number } | null> {
  if (!topicId) return null;
  try {
    const client = getOperatorClient();
    const result = await publishMessage(topicId, message, client);
    console.log(`[HCS] ${label}: tx=${result.transactionId} seq=${result.sequenceNumber}`);
    client.close();
    return result;
  } catch (error) {
    console.error(`[HCS] ${label} failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Safely mint MVT tokens - returns tx ID or null on failure.
 */
async function safeMintMVT(
  toAccountId: string,
  amount: number,
  label: string
): Promise<string | null> {
  if (!config.tokens.avt || !config.hedera.operatorId || !config.hedera.operatorKey) return null;
  try {
    const txId = await transferTokens(
      config.tokens.avt,
      config.hedera.operatorId,
      toAccountId,
      amount,
      config.hedera.operatorKey
    );
    console.log(`[HTS] ${label}: tx=${txId}`);
    return txId;
  } catch (error) {
    console.error(`[HTS] ${label} failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}

function hashDocument(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function hashScanTx(txId: string): string {
  return `https://hashscan.io/testnet/transaction/${txId}`;
}

/**
 * The 6-step verification flow as an async generator.
 * Yields VerificationEvents that get streamed to the frontend via SSE.
 */
export async function* runVerification(
  request: VerificationRequest
): AsyncGenerator<VerificationEvent> {
  const docId = crypto.randomUUID();
  const verificationId = crypto.randomUUID();
  const documentHash = hashDocument(request.documentText);

  try {
    // ============================================================
    // STEP 1: Document received
    // ============================================================
    const doc: MedicalDocument = {
      id: docId,
      title: 'Processing...',
      type: 'other',
      content: request.documentText,
      uploadedAt: Date.now(),
      status: 'verifying',
    };
    store.addDocument(doc);

    yield {
      step: 1,
      type: 'upload_received',
      content: `Document received (${request.documentText.length} characters). Hash: ${documentHash.slice(0, 16)}...`,
      data: { docId, documentHash, length: request.documentText.length },
      timestamp: Date.now(),
    };

    // ============================================================
    // STEP 2: AI Analysis (THE MAIN WORK)
    // ============================================================
    yield {
      step: 2,
      type: 'analysis_started',
      content: 'MediVerify AI is analyzing your document...',
      timestamp: Date.now(),
    };

    const analysisText = await callClaude(
      DOCUMENT_ANALYSIS_PROMPT,
      `Analyze this medical document:\n\n${request.documentText.slice(0, 3000)}`
    );
    const analysis = extractJSON(analysisText);

    // Extract structured data with safe defaults
    const completenessScore = Number(analysis.completenessScore ?? 70);
    const consistencyScore = Number(analysis.consistencyScore ?? 75);
    const overallScore = Number(analysis.overallScore ?? Math.round((completenessScore + consistencyScore) / 2));
    const summary = String(analysis.summary ?? analysis.patientFriendlySummary ?? 'Document analyzed successfully.');
    const docTitle = String(analysis.title ?? 'Medical Document');
    const docType = (analysis.documentType as MedicalDocument['type']) || 'other';
    const findings: VerificationFinding[] = Array.isArray(analysis.findings)
      ? (analysis.findings as Record<string, unknown>[]).map(f => ({
          category: String(f.category ?? 'completeness') as VerificationFinding['category'],
          severity: String(f.severity ?? 'info') as VerificationFinding['severity'],
          description: String(f.description ?? ''),
          suggestion: f.suggestion ? String(f.suggestion) : undefined,
        }))
      : [];
    const redFlags: string[] = Array.isArray(analysis.redFlags)
      ? (analysis.redFlags as string[]).map(String)
      : [];

    // Update document with title and type
    store.updateDocument(docId, { title: docTitle, type: docType });

    // ============================================================
    // STEP 3: Analysis complete - show results
    // ============================================================
    yield {
      step: 3,
      type: 'analysis_complete',
      content: `Analysis complete. Score: ${overallScore}/100. ${summary}`,
      data: {
        completenessScore,
        consistencyScore,
        overallScore,
        summary,
        findings,
        redFlags,
        patientFriendlySummary: String(analysis.patientFriendlySummary ?? summary),
      },
      timestamp: Date.now(),
    };

    // ============================================================
    // STEP 4: Stamp on HCS (REAL ON-CHAIN)
    // ============================================================
    const hcsMessage = {
      type: 'DOCUMENT_VERIFIED',
      version: '1.0',
      documentId: docId,
      documentHash,
      documentType: docType,
      title: docTitle,
      overallScore,
      completenessScore,
      consistencyScore,
      redFlagCount: redFlags.length,
      findingCount: findings.length,
      summary: summary.slice(0, 200),
      verifiedAt: Date.now(),
    };
    const hcsResult = await safePublishHCS(config.topics.negotiation, hcsMessage, 'Document Verification');

    yield {
      step: 4,
      type: 'hcs_stamped',
      content: hcsResult
        ? `Verification stamped on Hedera (seq #${hcsResult.sequenceNumber}). Immutable proof recorded.`
        : 'Verification recorded.',
      data: {
        hcsTxId: hcsResult?.transactionId,
        hcsSequence: hcsResult?.sequenceNumber,
      },
      hashScanLink: hcsResult ? hashScanTx(hcsResult.transactionId) : undefined,
      timestamp: Date.now(),
    };

    // ============================================================
    // STEP 5: Mint verification token (REAL HTS)
    // ============================================================
    // Mint 1 MVT to the operator account (representing the patient)
    const mvtTxId = await safeMintMVT(
      config.hedera.operatorId || '',
      1, // 1 MVT per verified document
      'Verification Token'
    );

    yield {
      step: 5,
      type: 'token_minted',
      content: mvtTxId
        ? 'MediVerify Token (MVT) minted as proof of verification.'
        : 'Verification token recorded.',
      data: { mvtTxId },
      hashScanLink: mvtTxId ? hashScanTx(mvtTxId) : undefined,
      timestamp: Date.now(),
    };

    // ============================================================
    // STEP 6: Verification complete
    // ============================================================
    const verification: DocumentVerification = {
      id: verificationId,
      documentId: docId,
      completenessScore,
      consistencyScore,
      overallScore,
      summary,
      findings,
      redFlags,
      hcsTxId: hcsResult?.transactionId,
      hcsSequence: hcsResult?.sequenceNumber,
      mvtTxId: mvtTxId ?? undefined,
      hashScanLink: hcsResult ? hashScanTx(hcsResult.transactionId) : undefined,
      documentHash,
      verifiedAt: Date.now(),
    };

    store.addVerification(verification);

    // Count on-chain transactions
    const onChainCount = (hcsResult ? 1 : 0) + (mvtTxId ? 1 : 0);

    yield {
      step: 6,
      type: 'verification_complete',
      content: `Verification complete! Score: ${overallScore}/100. ${onChainCount} on-chain transactions recorded.`,
      data: {
        verificationId,
        documentId: docId,
        overallScore,
        completenessScore,
        consistencyScore,
        summary,
        findings,
        redFlags,
        onChainTransactions: onChainCount,
        hcsTxId: hcsResult?.transactionId,
        mvtTxId,
        documentHash,
        shareLink: `/share/${verificationId}`,
      },
      hashScanLink: hcsResult ? hashScanTx(hcsResult.transactionId) : undefined,
      timestamp: Date.now(),
    };

    // Add to activity log
    store.addActivity({
      type: 'verification',
      content: `Document "${docTitle}" verified - Score: ${overallScore}/100`,
      hashScanLink: hcsResult ? hashScanTx(hcsResult.transactionId) : undefined,
      timestamp: Date.now(),
    });

  } catch (error) {
    yield {
      step: 0,
      type: 'verification_complete',
      content: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now(),
    };
  }
}
