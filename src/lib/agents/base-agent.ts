import { callClaude } from './llm-client';
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

export function extractJSON(text: string): Record<string, unknown> {
  // Try direct parse first
  try { return JSON.parse(text); } catch { /* continue */ }
  // Extract JSON from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1].trim()); } catch { /* continue */ }
  }
  // Find first { ... } block
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try { return JSON.parse(braceMatch[0]); } catch { /* continue */ }
  }
  return { raw: text };
}

export abstract class BaseAgent {
  profile: AgentProfile;

  constructor(profile: AgentProfile) {
    this.profile = profile;
  }

  async evaluateRequest(request: { capabilities: string[]; description: string; budget: number }) {
    const text = await callClaude(
      EVALUATE_PROMPT,
      `My capabilities: ${this.profile.capabilities.join(', ')}\nMy base price: ${this.profile.pricing.basePrice} HBAR\n\nService request:\n${JSON.stringify(request)}`,
    );
    const parsed = extractJSON(text);
    return {
      canHandle: Boolean(parsed.canHandle ?? true),
      confidence: Number(parsed.confidence ?? 0.8),
      reason: String(parsed.reason ?? 'Capable of handling this request'),
    };
  }

  async generateOffer(request: { description: string; budget: number }) {
    const text = await callClaude(
      OFFER_PROMPT,
      `My base price: ${this.profile.pricing.basePrice} HBAR\nBudget limit: ${request.budget} HBAR\n\nRequest: ${request.description}`,
    );
    const parsed = extractJSON(text);
    return {
      price: Number(parsed.price ?? this.profile.pricing.basePrice),
      estimatedTime: String(parsed.estimatedTime ?? '30s'),
      approach: String(parsed.approach ?? 'Will analyze and provide detailed results'),
    };
  }

  abstract executeService(input: Record<string, unknown>): Promise<Record<string, unknown>>;

  async generateRating(serviceResult: Record<string, unknown>) {
    const text = await callClaude(
      RATING_PROMPT,
      `Service result to rate:\n${JSON.stringify(serviceResult).slice(0, 1000)}`,
    );
    const parsed = extractJSON(text);
    return {
      score: Number(parsed.score ?? 4),
      comment: String(parsed.comment ?? 'Good quality service delivery'),
    };
  }
}
