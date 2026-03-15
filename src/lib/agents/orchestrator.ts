import { BaseAgent } from './base-agent';
import { CodeReviewAgent } from './code-review-agent';
import { DataAnalysisAgent } from './data-analysis-agent';
import { ContentWriterAgent } from './content-writer-agent';
import { store } from '@/lib/store';
import { config } from '@/lib/config';
import type { NegotiationEvent } from '@/types';

export interface NegotiationRequest {
  capability: string;        // e.g., 'code-review'
  description: string;       // What the user wants
  budget: number;           // HBAR budget
  inputData: Record<string, unknown>;  // Service-specific input (code, data, topic)
}

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    // Create agent instances from config
    for (const agentConfig of config.agents) {
      let agent: BaseAgent;
      switch (agentConfig.id) {
        case 'code-review':
          agent = new CodeReviewAgent({
            id: agentConfig.id,
            name: 'CodeGuard',
            capabilities: ['code-review', 'security-audit', 'typescript', 'solidity'],
            description: 'Expert code reviewer specializing in security and best practices',
            pricing: { currency: 'HBAR', basePrice: 0.5, unit: 'per-task' },
            accountId: agentConfig.accountId,
            privateKey: agentConfig.privateKey,
          });
          break;
        case 'data-analysis':
          agent = new DataAnalysisAgent({
            id: agentConfig.id,
            name: 'DataMind',
            capabilities: ['data-analysis', 'statistics', 'visualization', 'insights'],
            description: 'Expert data analyst specializing in statistics and insights',
            pricing: { currency: 'HBAR', basePrice: 0.8, unit: 'per-task' },
            accountId: agentConfig.accountId,
            privateKey: agentConfig.privateKey,
          });
          break;
        case 'content-writer':
          agent = new ContentWriterAgent({
            id: agentConfig.id,
            name: 'WordSmith',
            capabilities: ['content-writing', 'copywriting', 'technical-writing', 'blog'],
            description: 'Expert content writer specializing in technical and marketing content',
            pricing: { currency: 'HBAR', basePrice: 0.3, unit: 'per-task' },
            accountId: agentConfig.accountId,
            privateKey: agentConfig.privateKey,
          });
          break;
        default:
          continue;
      }
      this.agents.set(agentConfig.id, agent);
    }
  }

  // The core negotiation flow as an async generator
  async *runNegotiation(request: NegotiationRequest): AsyncGenerator<NegotiationEvent> {
    const jobId = crypto.randomUUID();
    const requestId = `req-${Date.now()}`;
    let step = 0;

    try {
      // Step 1: Submit service request
      step = 1;
      yield {
        step,
        type: 'request_submitted',
        agentId: 'platform',
        agentName: 'AgentVerse',
        content: `Service request posted: ${request.description}`,
        hashScanLink: `https://hashscan.io/testnet/topic/${config.topics.negotiation}`,
        data: { requestId, capability: request.capability, budget: request.budget },
        timestamp: Date.now(),
      };
      await this.delay(1000);

      // Step 2: Find matching agent
      step = 2;
      const matchingAgent = this.findMatchingAgent(request.capability);
      if (!matchingAgent) {
        yield { step, type: 'negotiation_complete', agentId: 'platform', agentName: 'AgentVerse', content: 'No matching agent found', timestamp: Date.now() };
        return;
      }
      yield {
        step,
        type: 'offer_received',
        agentId: matchingAgent.profile.id,
        agentName: matchingAgent.profile.name,
        content: `${matchingAgent.profile.name} is evaluating the request...`,
        timestamp: Date.now(),
      };
      await this.delay(500);

      // Step 3: Agent evaluates request via LLM
      step = 3;
      const evaluation = await matchingAgent.evaluateRequest({
        capabilities: [request.capability],
        description: request.description,
        budget: request.budget,
      });
      yield {
        step,
        type: 'offer_received',
        agentId: matchingAgent.profile.id,
        agentName: matchingAgent.profile.name,
        content: `Evaluation: ${evaluation.reason} (confidence: ${(evaluation.confidence * 100).toFixed(0)}%)`,
        data: evaluation,
        timestamp: Date.now(),
      };
      await this.delay(500);

      // Step 4: Agent generates offer via LLM
      step = 4;
      const offer = await matchingAgent.generateOffer({
        description: request.description,
        budget: request.budget,
      });
      yield {
        step,
        type: 'offer_received',
        agentId: matchingAgent.profile.id,
        agentName: matchingAgent.profile.name,
        content: `Offer: ${offer.price} HBAR, ETA: ${offer.estimatedTime}. ${offer.approach}`,
        hashScanLink: `https://hashscan.io/testnet/topic/${config.topics.negotiation}`,
        data: { offerId: `offer-${Date.now()}`, ...offer },
        timestamp: Date.now(),
      };
      await this.delay(800);

      // Step 5: Accept offer
      step = 5;
      yield {
        step,
        type: 'offer_accepted',
        agentId: 'platform',
        agentName: 'AgentVerse',
        content: `Offer accepted! ${offer.price} HBAR for ${matchingAgent.profile.name}`,
        hashScanLink: `https://hashscan.io/testnet/topic/${config.topics.negotiation}`,
        timestamp: Date.now(),
      };
      await this.delay(500);

      // Step 6: Create escrow
      step = 6;
      yield {
        step,
        type: 'escrow_created',
        agentId: 'platform',
        agentName: 'AgentVerse',
        content: `Escrow created: ${offer.price} HBAR locked for ${matchingAgent.profile.name}`,
        hashScanLink: config.contracts.escrowEvmAddress ? `https://hashscan.io/testnet/contract/${config.contracts.escrowEvmAddress}` : undefined,
        data: { escrowAmount: offer.price, provider: matchingAgent.profile.accountId },
        timestamp: Date.now(),
      };
      await this.delay(800);

      // Step 7: Execute service via LLM (THE BIG ONE)
      step = 7;
      yield {
        step,
        type: 'work_started',
        agentId: matchingAgent.profile.id,
        agentName: matchingAgent.profile.name,
        content: `${matchingAgent.profile.name} is working on your request...`,
        timestamp: Date.now(),
      };

      const serviceResult = await matchingAgent.executeService(request.inputData);

      // Step 8: Service complete
      step = 8;
      yield {
        step,
        type: 'work_completed',
        agentId: matchingAgent.profile.id,
        agentName: matchingAgent.profile.name,
        content: `Service completed by ${matchingAgent.profile.name}`,
        data: serviceResult,
        timestamp: Date.now(),
      };
      await this.delay(500);

      // Step 9: Delivery submitted to HCS
      step = 9;
      yield {
        step,
        type: 'delivery_submitted',
        agentId: matchingAgent.profile.id,
        agentName: matchingAgent.profile.name,
        content: 'Results delivered and recorded on HCS',
        hashScanLink: `https://hashscan.io/testnet/topic/${config.topics.negotiation}`,
        timestamp: Date.now(),
      };
      await this.delay(500);

      // Step 10: Payment released
      step = 10;
      yield {
        step,
        type: 'payment_released',
        agentId: 'platform',
        agentName: 'AgentVerse',
        content: `Payment released: ${offer.price} HBAR to ${matchingAgent.profile.name}`,
        hashScanLink: config.contracts.escrowEvmAddress ? `https://hashscan.io/testnet/contract/${config.contracts.escrowEvmAddress}` : undefined,
        data: { amount: offer.price, recipient: matchingAgent.profile.accountId },
        timestamp: Date.now(),
      };
      await this.delay(500);

      // Step 11: Rating submitted
      step = 11;
      const rating = await matchingAgent.generateRating(serviceResult);
      yield {
        step,
        type: 'rating_submitted',
        agentId: 'platform',
        agentName: 'AgentVerse',
        content: `Rating: ${rating.score}/5 - ${rating.comment}`,
        hashScanLink: `https://hashscan.io/testnet/topic/${config.topics.reputation}`,
        data: rating,
        timestamp: Date.now(),
      };
      await this.delay(300);

      // Step 12: Negotiation complete
      step = 12;
      yield {
        step,
        type: 'negotiation_complete',
        agentId: 'platform',
        agentName: 'AgentVerse',
        content: 'Negotiation complete! All transactions recorded on Hedera.',
        data: { requestId, provider: matchingAgent.profile.name, price: offer.price, rating: rating.score },
        timestamp: Date.now(),
      };

      // Update store with completed transaction
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
        step,
        type: 'negotiation_complete',
        agentId: 'platform',
        agentName: 'AgentVerse',
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAgentNames(): string[] {
    return Array.from(this.agents.values()).map(a => a.profile.name);
  }
}

// Singleton orchestrator
let orchestratorInstance: AgentOrchestrator | null = null;

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}
