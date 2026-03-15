import { callClaude } from './llm-client';
import { BaseAgent, AgentProfile, extractJSON } from './base-agent';
import { CODE_REVIEW_PROMPT } from './prompts';

export class CodeReviewAgent extends BaseAgent {
  constructor(profile: AgentProfile) {
    super(profile);
  }

  async executeService(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const code = (input.code as string) || (input.description as string) || '';
    const text = await callClaude(
      CODE_REVIEW_PROMPT,
      `Review this code:\n\n\`\`\`\n${code}\n\`\`\``,
    );
    return extractJSON(text);
  }
}
