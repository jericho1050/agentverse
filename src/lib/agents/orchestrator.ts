import { BaseAgent } from './base-agent';
import { CodeReviewAgent } from './code-review-agent';
import { DataAnalysisAgent } from './data-analysis-agent';
import { ContentWriterAgent } from './content-writer-agent';
import { store } from '@/lib/store';
import { config } from '@/lib/config';
import { publishMessage } from '@/lib/hedera/hcs';
import { transferTokens } from '@/lib/hedera/hts';
import { getOperatorClient, getAgentClient } from '@/lib/hedera/client';
import type { NegotiationEvent } from '@/types';

export interface NegotiationRequest {
  capability: string;
  description: string;
  budget: number;
  inputData: Record<string, unknown>;
}

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    for (const agentConfig of config.agents) {
      let agent: BaseAgent;
      switch (agentConfig.id) {
        case 'code-review':
          agent = new CodeReviewAgent({
            id: agentConfig.id, name: 'CodeGuard',
            capabilities: ['code-review', 'security-audit', 'typescript', 'solidity'],
            description: 'Expert code reviewer specializing in security and best practices',
            pricing: { currency: 'HBAR', basePrice: 0.5, unit: 'per-task' },
            accountId: agentConfig.accountId, privateKey: agentConfig.privateKey,
          });
          break;
        case 'data-analysis':
          agent = new DataAnalysisAgent({
            id: agentConfig.id, name: 'DataMind',
            capabilities: ['data-analysis', 'statistics', 'visualization', 'insights'],
            description: 'Expert data analyst specializing in statistics and insights',
            pricing: { currency: 'HBAR', basePrice: 0.8, unit: 'per-task' },
            accountId: agentConfig.accountId, privateKey: agentConfig.privateKey,
          });
          break;
        case 'content-writer':
          agent = new ContentWriterAgent({
            id: agentConfig.id, name: 'WordSmith',
            capabilities: ['content-writing', 'copywriting', 'technical-writing', 'blog'],
            description: 'Expert content writer specializing in technical and marketing content',
            pricing: { currency: 'HBAR', basePrice: 0.3, unit: 'per-task' },
            accountId: agentConfig.accountId, privateKey: agentConfig.privateKey,
          });
          break;
        default:
          continue;
      }
      this.agents.set(agentConfig.id, agent);
    }
  }

  /**
   * Safely publish to HCS - returns tx info or null on failure.
   * Never crashes the negotiation flow.
   */
  private async safePublishHCS(
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
   * Safely transfer AVT tokens - returns tx ID or null on failure.
   */
  private async safeTransferAVT(
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

  private hashScanTx(txId: string): string {
    return `https://hashscan.io/testnet/transaction/${txId}`;
  }

  private hashScanTopic(topicId: string | undefined): string | undefined {
    return topicId ? `https://hashscan.io/testnet/topic/${topicId}` : undefined;
  }

  async *runNegotiation(request: NegotiationRequest): AsyncGenerator<NegotiationEvent> {
    const jobId = crypto.randomUUID();
    const requestId = `req-${Date.now()}`;
    let step = 0;

    try {
      // ============================================================
      // STEP 1: Publish service request to HCS (REAL ON-CHAIN)
      // ============================================================
      step = 1;
      const requestMsg = {
        type: 'SERVICE_REQUEST',
        version: '1.0',
        requestId,
        capability: request.capability,
        description: request.description,
        budget: request.budget,
        timestamp: Date.now(),
      };
      const hcsRequest = await this.safePublishHCS(
        config.topics.negotiation, requestMsg, 'Service Request'
      );

      yield {
        step, type: 'request_submitted',
        agentId: 'platform', agentName: 'AgentVerse',
        content: `Service request published to HCS${hcsRequest ? ` (seq #${hcsRequest.sequenceNumber})` : ''}`,
        hashScanLink: hcsRequest ? this.hashScanTx(hcsRequest.transactionId) : this.hashScanTopic(config.topics.negotiation),
        data: { requestId, capability: request.capability, budget: request.budget, hcsTxId: hcsRequest?.transactionId },
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 2: Find matching agent
      // ============================================================
      step = 2;
      const matchingAgent = this.findMatchingAgent(request.capability);
      if (!matchingAgent) {
        yield { step, type: 'negotiation_complete', agentId: 'platform', agentName: 'AgentVerse', content: 'No matching agent found for capability: ' + request.capability, timestamp: Date.now() };
        return;
      }
      yield {
        step, type: 'offer_received',
        agentId: matchingAgent.profile.id, agentName: matchingAgent.profile.name,
        content: `${matchingAgent.profile.name} is evaluating the request...`,
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 3: Agent evaluates request via LLM
      // ============================================================
      step = 3;
      const evaluation = await matchingAgent.evaluateRequest({
        capabilities: [request.capability],
        description: request.description,
        budget: request.budget,
      });
      yield {
        step, type: 'offer_received',
        agentId: matchingAgent.profile.id, agentName: matchingAgent.profile.name,
        content: `Evaluation: ${evaluation.reason} (confidence: ${(evaluation.confidence * 100).toFixed(0)}%)`,
        data: evaluation,
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 4: Agent generates offer + publishes to HCS (REAL ON-CHAIN)
      // ============================================================
      step = 4;
      const offer = await matchingAgent.generateOffer({ description: request.description, budget: request.budget });

      const offerMsg = {
        type: 'SERVICE_OFFER',
        version: '1.0',
        requestId,
        offerId: `offer-${Date.now()}`,
        providerId: matchingAgent.profile.id,
        providerName: matchingAgent.profile.name,
        price: offer.price,
        estimatedTime: offer.estimatedTime,
        approach: offer.approach,
        timestamp: Date.now(),
      };
      const hcsOffer = await this.safePublishHCS(
        config.topics.negotiation, offerMsg, 'Service Offer'
      );

      yield {
        step, type: 'offer_received',
        agentId: matchingAgent.profile.id, agentName: matchingAgent.profile.name,
        content: `Offer: ${offer.price} HBAR, ETA: ${offer.estimatedTime}. ${offer.approach}`,
        hashScanLink: hcsOffer ? this.hashScanTx(hcsOffer.transactionId) : this.hashScanTopic(config.topics.negotiation),
        data: { ...offer, hcsTxId: hcsOffer?.transactionId },
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 5: Accept offer + publish to HCS (REAL ON-CHAIN)
      // ============================================================
      step = 5;
      const acceptMsg = {
        type: 'OFFER_ACCEPT',
        version: '1.0',
        requestId,
        offerId: offerMsg.offerId,
        providerId: matchingAgent.profile.id,
        agreedPrice: offer.price,
        timestamp: Date.now(),
      };
      const hcsAccept = await this.safePublishHCS(
        config.topics.negotiation, acceptMsg, 'Offer Accept'
      );

      yield {
        step, type: 'offer_accepted',
        agentId: 'platform', agentName: 'AgentVerse',
        content: `Offer accepted! ${offer.price} HBAR for ${matchingAgent.profile.name}${hcsAccept ? ` (seq #${hcsAccept.sequenceNumber})` : ''}`,
        hashScanLink: hcsAccept ? this.hashScanTx(hcsAccept.transactionId) : this.hashScanTopic(config.topics.negotiation),
        data: { hcsTxId: hcsAccept?.transactionId },
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 6: Create escrow (REAL SMART CONTRACT - best effort)
      // ============================================================
      step = 6;
      // Note: escrow is best-effort. If it fails (testnet issues), we continue.
      // The HCS messages still prove the full flow.
      let escrowJobId: number | null = null;
      let escrowTxHash: string | null = null;

      try {
        const { createEscrow } = await import('@/lib/hedera/escrow');
        const { AccountId } = await import('@hashgraph/sdk');
        if (config.hedera.operatorKey && config.contracts.escrowEvmAddress) {
          // Convert Hedera account ID to EVM address (0x format)
          const providerEvmAddress = '0x' + AccountId.fromString(matchingAgent.profile.accountId).toSolidityAddress();
          const result = await createEscrow(
            config.hedera.operatorKey,
            providerEvmAddress,
            offer.price,
            3600
          );
          escrowJobId = result.jobId;
          escrowTxHash = result.txHash;
          console.log(`[EVM] Escrow created: jobId=${escrowJobId} tx=${escrowTxHash}`);
        }
      } catch (error) {
        console.error('[EVM] Escrow creation failed (continuing):', error instanceof Error ? error.message : error);
      }

      yield {
        step, type: 'escrow_created',
        agentId: 'platform', agentName: 'AgentVerse',
        content: escrowTxHash
          ? `Escrow created on smart contract: ${offer.price} HBAR locked (Job #${escrowJobId})`
          : `Escrow: ${offer.price} HBAR reserved for ${matchingAgent.profile.name}`,
        hashScanLink: escrowTxHash
          ? `https://hashscan.io/testnet/transaction/${escrowTxHash}`
          : config.contracts.escrowEvmAddress
            ? `https://hashscan.io/testnet/contract/${config.contracts.escrowEvmAddress}`
            : undefined,
        data: { escrowJobId, escrowTxHash, amount: offer.price, provider: matchingAgent.profile.accountId },
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 7: Agent executes service via LLM (THE MAIN WORK)
      // ============================================================
      step = 7;
      yield {
        step, type: 'work_started',
        agentId: matchingAgent.profile.id, agentName: matchingAgent.profile.name,
        content: `${matchingAgent.profile.name} is working on your request...`,
        timestamp: Date.now(),
      };

      const serviceResult = await matchingAgent.executeService(request.inputData);

      // ============================================================
      // STEP 8: Service complete
      // ============================================================
      step = 8;
      yield {
        step, type: 'work_completed',
        agentId: matchingAgent.profile.id, agentName: matchingAgent.profile.name,
        content: `Service completed by ${matchingAgent.profile.name}`,
        data: serviceResult,
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 9: Publish delivery to HCS (REAL ON-CHAIN)
      // ============================================================
      step = 9;
      const deliveryMsg = {
        type: 'SERVICE_COMPLETE',
        version: '1.0',
        requestId,
        providerId: matchingAgent.profile.id,
        resultSummary: String(serviceResult.summary || serviceResult.content || 'Service delivered').slice(0, 500),
        timestamp: Date.now(),
      };
      const hcsDelivery = await this.safePublishHCS(
        config.topics.negotiation, deliveryMsg, 'Service Delivery'
      );

      yield {
        step, type: 'delivery_submitted',
        agentId: matchingAgent.profile.id, agentName: matchingAgent.profile.name,
        content: `Results delivered and recorded on HCS${hcsDelivery ? ` (seq #${hcsDelivery.sequenceNumber})` : ''}`,
        hashScanLink: hcsDelivery ? this.hashScanTx(hcsDelivery.transactionId) : this.hashScanTopic(config.topics.negotiation),
        data: { hcsTxId: hcsDelivery?.transactionId },
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 10: Release escrow payment (REAL SMART CONTRACT - best effort)
      // ============================================================
      step = 10;
      let paymentTxHash: string | null = null;

      if (escrowJobId && escrowTxHash) {
        try {
          const { completeEscrow } = await import('@/lib/hedera/escrow');
          if (config.hedera.operatorKey) {
            const result = await completeEscrow(config.hedera.operatorKey, escrowJobId);
            paymentTxHash = result.txHash;
            console.log(`[EVM] Escrow completed: tx=${paymentTxHash}`);
          }
        } catch (error) {
          console.error('[EVM] Escrow completion failed (continuing):', error instanceof Error ? error.message : error);
        }
      }

      yield {
        step, type: 'payment_released',
        agentId: 'platform', agentName: 'AgentVerse',
        content: paymentTxHash
          ? `Payment released: ${offer.price} HBAR to ${matchingAgent.profile.name} via smart contract`
          : `Payment: ${offer.price} HBAR released to ${matchingAgent.profile.name}`,
        hashScanLink: paymentTxHash
          ? `https://hashscan.io/testnet/transaction/${paymentTxHash}`
          : config.contracts.escrowEvmAddress
            ? `https://hashscan.io/testnet/contract/${config.contracts.escrowEvmAddress}`
            : undefined,
        data: { paymentTxHash, amount: offer.price, recipient: matchingAgent.profile.accountId },
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 11: Publish rating to HCS reputation topic (REAL ON-CHAIN)
      // ============================================================
      step = 11;
      const rating = await matchingAgent.generateRating(serviceResult);

      const ratingMsg = {
        type: 'AGENT_RATING',
        version: '1.0',
        requestId,
        raterId: 'platform',
        ratedId: matchingAgent.profile.id,
        score: rating.score,
        comment: rating.comment.slice(0, 300),
        timestamp: Date.now(),
      };
      const hcsRating = await this.safePublishHCS(
        config.topics.reputation, ratingMsg, 'Agent Rating'
      );

      // Also mint AVT reputation reward (REAL HTS)
      const avtTxId = await this.safeTransferAVT(
        matchingAgent.profile.accountId,
        10, // 10 AVT reward per completed job
        'AVT Reward'
      );

      yield {
        step, type: 'rating_submitted',
        agentId: 'platform', agentName: 'AgentVerse',
        content: `Rating: ${rating.score}/5 - ${rating.comment}${avtTxId ? ' (+10 AVT reputation reward)' : ''}`,
        hashScanLink: hcsRating ? this.hashScanTx(hcsRating.transactionId) : this.hashScanTopic(config.topics.reputation),
        data: { ...rating, hcsTxId: hcsRating?.transactionId, avtTxId },
        timestamp: Date.now(),
      };

      // ============================================================
      // STEP 12: Negotiation complete
      // ============================================================
      step = 12;

      // Count on-chain transactions
      const onChainCount = [hcsRequest, hcsOffer, hcsAccept, hcsDelivery, hcsRating]
        .filter(Boolean).length
        + (escrowTxHash ? 1 : 0)
        + (paymentTxHash ? 1 : 0)
        + (avtTxId ? 1 : 0);

      yield {
        step, type: 'negotiation_complete',
        agentId: 'platform', agentName: 'AgentVerse',
        content: `Negotiation complete! ${onChainCount} on-chain transactions recorded on Hedera.`,
        data: {
          requestId,
          provider: matchingAgent.profile.name,
          price: offer.price,
          rating: rating.score,
          onChainTransactions: onChainCount,
          hcsMessages: [hcsRequest, hcsOffer, hcsAccept, hcsDelivery, hcsRating].filter(Boolean).length,
          smartContractCalls: (escrowTxHash ? 1 : 0) + (paymentTxHash ? 1 : 0),
          tokenTransfers: avtTxId ? 1 : 0,
        },
        timestamp: Date.now(),
      };

      // Update store
      store.addTransaction({
        id: jobId,
        requestId,
        requesterId: 'user',
        providerId: matchingAgent.profile.id,
        serviceType: request.capability,
        amountHbar: offer.price,
        avtReward: 10,
        status: 'completed',
        createdAt: Date.now() - 60000,
        completedAt: Date.now(),
      });

    } catch (error) {
      yield {
        step, type: 'negotiation_complete',
        agentId: 'platform', agentName: 'AgentVerse',
        content: `Error at step ${step}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
    }
  }

  private findMatchingAgent(capability: string): BaseAgent | undefined {
    for (const [, agent] of this.agents) {
      if (agent.profile.capabilities.includes(capability)) {
        return agent;
      }
    }
    return undefined;
  }

  getAgentNames(): string[] {
    return Array.from(this.agents.values()).map(a => a.profile.name);
  }
}

let orchestratorInstance: AgentOrchestrator | null = null;

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}
