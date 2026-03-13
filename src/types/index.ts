// Template Chat Types (used by hedera-agent-kit template components)
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

// HCS Message Base Types
export interface HCSMessageBase {
  version: '1.0';
  timestamp: number;
}

// HCS Message Types - All messages sent to Hedera Consensus Service

export interface AgentRegistration extends HCSMessageBase {
  type: 'AGENT_REGISTER';
  agentId: string;
  name: string;
  capabilities: string[];
  description: string;
  pricing: {
    currency: 'HBAR';
    basePrice: number;
    unit: 'per-task';
  };
  accountId: string;
  evmAddress: string;
}

export interface ServiceRequest extends HCSMessageBase {
  type: 'SERVICE_REQUEST';
  requestId: string;
  requesterId: string;
  requiredCapabilities: string[];
  description: string;
  budget: number; // in HBAR
  inputData: Record<string, unknown>;
  deadline: number; // timestamp
}

export interface ServiceOffer extends HCSMessageBase {
  type: 'SERVICE_OFFER';
  offerId: string;
  requestId: string;
  providerId: string;
  price: number; // in HBAR
  estimatedTime: string;
  confidence: number; // 0-1
}

export interface OfferAcceptance extends HCSMessageBase {
  type: 'OFFER_ACCEPT';
  requestId: string;
  offerId: string;
  escrowJobId: number;
}

export interface ServiceDelivery extends HCSMessageBase {
  type: 'SERVICE_COMPLETE';
  requestId: string;
  providerId: string;
  resultSummary: string;
  resultHash: string; // IPFS or content hash
}

export interface AgentRating extends HCSMessageBase {
  type: 'AGENT_RATING';
  requestId: string;
  raterId: string;
  ratedId: string;
  score: number; // 1-5
  comment: string;
}

// Union type for all HCS messages
export type HCSMessage =
  | AgentRegistration
  | ServiceRequest
  | ServiceOffer
  | OfferAcceptance
  | ServiceDelivery
  | AgentRating;

// Application Types

export interface Agent {
  // Base registration fields
  agentId: string;
  name: string;
  capabilities: string[];
  description: string;
  pricing: {
    currency: 'HBAR';
    basePrice: number;
    unit: 'per-task';
  };
  accountId: string;
  evmAddress: string;

  // Runtime fields
  reputationScore: number;
  totalJobs: number;
  isOnline: boolean;
}

export interface Transaction {
  id: string;
  requestId: string;
  requesterId: string;
  providerId: string;
  serviceType: string;
  amountHbar: number;
  avtReward: number; // AVT is the reputation token
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  escrowJobId?: number;
  createdAt: number; // timestamp
  completedAt?: number; // timestamp
}

export interface NegotiationEvent {
  step: number;
  type:
    | 'request_submitted'
    | 'offer_received'
    | 'offer_accepted'
    | 'escrow_created'
    | 'work_started'
    | 'progress_update'
    | 'work_completed'
    | 'delivery_submitted'
    | 'verification_started'
    | 'payment_released'
    | 'rating_submitted'
    | 'negotiation_complete';
  agentId: string;
  agentName: string;
  content: string;
  hashScanLink?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface ActivityEvent {
  type: 'registration' | 'request' | 'offer' | 'acceptance' | 'delivery' | 'rating';
  agentName: string;
  content: string;
  hashScanLink: string;
  timestamp: number;
  topicId: string;
  sequenceNumber: number;
}

export interface AgentBalance {
  agentId: string;
  accountId: string;
  hbarBalance: number;
  avtBalance: number; // AVT is the reputation token
}

export interface DashboardStats {
  totalAgents: number;
  totalTransactions: number;
  activeNegotiations: number;
  totalAvtVolume: number;
}
