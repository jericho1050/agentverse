import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai';
import { BaseAgent, AgentProfile } from './base-agent';
import { CODE_REVIEW_PROMPT } from './prompts';

const model = bedrock('us.anthropic.claude-sonnet-4-5-20250929-v1:0');

export class CodeReviewAgent extends BaseAgent {
  constructor(profile: AgentProfile) {
    super(profile);
  }

  async executeService(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const code = (input.code as string) || (input.description as string) || '';
    const { text } = await generateText({
      model,
      system: CODE_REVIEW_PROMPT,
      prompt: `Review this code:\n\n\`\`\`\n${code}\n\`\`\``,
    });
    return JSON.parse(text);
  }
}
