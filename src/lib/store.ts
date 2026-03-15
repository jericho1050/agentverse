import { Agent, Transaction, NegotiationEvent, ActivityEvent } from '@/types';
import { config } from '@/lib/config';
import { randomUUID } from 'crypto';

interface NegotiationJob {
  id: string;
  status: 'running' | 'complete' | 'error';
  events: NegotiationEvent[];
  result?: Record<string, unknown>;
  error?: string;
  createdAt: number;
}

class Store {
  private agents: Map<string, Agent> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private activityLog: ActivityEvent[] = [];
  private negotiationJobs: Map<string, NegotiationJob> = new Map();

  // Agent methods
  addAgent(agent: Agent): void {
    this.agents.set(agent.agentId, agent);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgentByCapability(capability: string): Agent | undefined {
    return Array.from(this.agents.values()).find(agent =>
      agent.capabilities.includes(capability)
    );
  }

  // Transaction methods
  addTransaction(tx: Transaction): void {
    this.transactions.set(tx.id, tx);
  }

  getTransactions(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const tx = this.transactions.get(id);
    if (tx) {
      this.transactions.set(id, { ...tx, ...updates });
    }
  }

  // Activity log methods
  addActivity(event: ActivityEvent): void {
    this.activityLog.unshift(event);
    // Keep only most recent 200 events
    if (this.activityLog.length > 200) {
      this.activityLog = this.activityLog.slice(0, 200);
    }
  }

  getRecentActivity(limit: number = 50): ActivityEvent[] {
    return this.activityLog.slice(0, limit);
  }

  // Negotiation job methods
  createNegotiationJob(): NegotiationJob {
    const job: NegotiationJob = {
      id: randomUUID(),
      status: 'running',
      events: [],
      createdAt: Date.now(),
    };
    this.negotiationJobs.set(job.id, job);
    return job;
  }

  getNegotiationJob(id: string): NegotiationJob | undefined {
    return this.negotiationJobs.get(id);
  }

  addNegotiationEvent(jobId: string, event: NegotiationEvent): void {
    const job = this.negotiationJobs.get(jobId);
    if (job) {
      job.events.push(event);
    }
  }

  completeNegotiationJob(jobId: string, result?: Record<string, unknown>): void {
    const job = this.negotiationJobs.get(jobId);
    if (job) {
      job.status = 'complete';
      job.result = result;
    }
  }

  failNegotiationJob(jobId: string, error: string): void {
    const job = this.negotiationJobs.get(jobId);
    if (job) {
      job.status = 'error';
      job.error = error;
    }
  }

  // Seed default agents
  seedDefaultAgents(): void {
    const findAgent = (id: string) => config.agents.find(a => a.id === id);

    const agents: Agent[] = [
      {
        agentId: 'code-review',
        name: 'CodeGuard',
        accountId: findAgent('code-review')?.accountId ?? '',
        evmAddress: '',
        capabilities: ['code-review', 'security-audit', 'typescript', 'solidity'],
        description: 'Expert code reviewer specializing in security audits and best practices for TypeScript and Solidity.',
        pricing: { currency: 'HBAR', basePrice: 0.5, unit: 'per-task' },
        reputationScore: 4.8,
        totalJobs: 47,
        isOnline: true,
      },
      {
        agentId: 'data-analysis',
        name: 'DataMind',
        accountId: findAgent('data-analysis')?.accountId ?? '',
        evmAddress: '',
        capabilities: ['data-analysis', 'statistics', 'visualization', 'insights'],
        description: 'Advanced data analyst providing statistical analysis, visualizations, and actionable insights.',
        pricing: { currency: 'HBAR', basePrice: 0.8, unit: 'per-task' },
        reputationScore: 4.6,
        totalJobs: 32,
        isOnline: true,
      },
      {
        agentId: 'content-writer',
        name: 'WordSmith',
        accountId: findAgent('content-writer')?.accountId ?? '',
        evmAddress: '',
        capabilities: ['content-writing', 'copywriting', 'technical-writing', 'blog'],
        description: 'Professional content writer skilled in copywriting, technical documentation, and engaging blog posts.',
        pricing: { currency: 'HBAR', basePrice: 0.3, unit: 'per-task' },
        reputationScore: 4.9,
        totalJobs: 61,
        isOnline: true,
      },
    ];

    agents.forEach(agent => this.addAgent(agent));
  }
}

// Export singleton instance
export const store = new Store();
