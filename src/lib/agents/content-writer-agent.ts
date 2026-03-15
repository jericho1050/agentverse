import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai';
import { BaseAgent, AgentProfile } from './base-agent';
import { CONTENT_WRITING_PROMPT } from './prompts';

const model = bedrock('us.anthropic.claude-sonnet-4-5-20250929-v1:0');

export class ContentWriterAgent extends BaseAgent {
  constructor(profile: AgentProfile) {
    super(profile);
  }

  async executeService(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const topic = (input.topic as string) || (input.description as string) || '';
    const tone = (input.tone as string) || 'professional';
    const length = (input.length as string) || 'medium';

    const { text } = await generateText({
      model,
      system: CONTENT_WRITING_PROMPT,
      prompt: `Write content about: ${topic}\nTone: ${tone}\nLength: ${length}`,
    });
    return JSON.parse(text);
  }
}
