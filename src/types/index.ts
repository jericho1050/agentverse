// ============= Template Types (keep for hedera-agent-kit compatibility) =============
export type AgentMode = 'autonomous' | 'human';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface TransactionStatus {
  transactionId: string;
  status: 'pending' | 'success' | 'error';
  description?: string;
}

export interface WalletPrepareResponse {
  ok: boolean;
  error?: string;
  bytesBase64?: string;
  result?: string;
  transactionId?: string;
}

export interface AgentResponse {
  ok: boolean;
  error?: string;
  mode: string;
  network: string;
  result: string;
}

// ============= MediVerify Types =============

export interface MedicalDocument {
  id: string;
  title: string;
  type: 'lab_result' | 'prescription' | 'diagnosis' | 'imaging' | 'other';
  content: string;           // The raw document text
  uploadedAt: number;
  status: 'pending' | 'verifying' | 'verified' | 'failed';
  verification?: DocumentVerification;
}

export interface DocumentVerification {
  id: string;
  documentId: string;
  completenessScore: number;    // 0-100
  consistencyScore: number;     // 0-100
  overallScore: number;         // 0-100
  summary: string;              // Plain English summary
  findings: VerificationFinding[];
  redFlags: string[];
  hcsTxId?: string;             // Hedera transaction ID
  hcsSequence?: number;
  mvtTxId?: string;             // MediVerify Token mint tx
  hashScanLink?: string;
  documentHash: string;         // SHA-256 hash of original content
  verifiedAt: number;
}

export interface VerificationFinding {
  category: 'completeness' | 'consistency' | 'anomaly' | 'positive';
  severity: 'info' | 'warning' | 'critical';
  description: string;
  suggestion?: string;
}

export interface VerificationEvent {
  step: number;
  type: 'upload_received' | 'analysis_started' | 'analysis_complete' | 'hcs_stamped' | 'token_minted' | 'verification_complete';
  content: string;
  data?: Record<string, unknown>;
  hashScanLink?: string;
  timestamp: number;
}

export interface VerificationStats {
  totalDocuments: number;
  totalVerified: number;
  averageScore: number;
  totalTokensMinted: number;
}

export interface ActivityEvent {
  type: string;
  content: string;
  hashScanLink?: string;
  timestamp: number;
  topicId?: string;
  sequenceNumber?: number;
}
