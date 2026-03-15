import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai';
import { EVALUATE_PROMPT, OFFER_PROMPT, RATING_PROMPT } from './prompts';

export interface AgentProfile {
  id: string;
  name: string;
  capabilities: string[];
  description: string;
  pricing: { currency: 'HBAR'; basePrice: number; unit: 'per-task' };
  accountId: string;
  privateKey: string;
}

const model = bedrock('us.anthropic.claude-sonnet-4-5-20250929-v1:0');

export abstract class BaseAgent {
  profile: AgentProfile;

  constructor(profile: AgentProfile) {
    this.profile = profile;
  }

  async evaluateRequest(request: { capabilities: string[]; description: string; budget: number }): Promise<{ canHandle: boolean; confidence: number; reason: string }> {
    const { text } = await generateText({
      model,
      system: EVALUATE_PROMPT,
      prompt: `My capabilities: ${this.profile.capabilities.join(', ')}\nMy base price: ${this.profile.pricing.basePrice} HBAR\n\nService request:\n${JSON.stringify(request)}`,
    });
    return JSON.parse(text);
  }

  async generateOffer(request: { description: string; budget: number }): Promise<{ price: number; estimatedTime: string; approach: string }> {
    const { text } = await generateText({
      model,
      system: OFFER_PROMPT,
      prompt: `My base price: ${this.profile.pricing.basePrice} HBAR\nBudget limit: ${request.budget} HBAR\n\nRequest: ${request.description}`,
    });
    return JSON.parse(text);
  }

  abstract executeService(input: Record<string, unknown>): Promise<Record<string, unknown>>;

  async generateRating(serviceResult: Record<string, unknown>): Promise<{ score: number; comment: string }> {
    const { text } = await generateText({
      model,
      system: RATING_PROMPT,
      prompt: `Service result to rate:\n${JSON.stringify(serviceResult)}`,
    });
    return JSON.parse(text);
  }
}
