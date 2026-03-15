import { callClaude } from './llm-client';
import { BaseAgent, AgentProfile, extractJSON } from './base-agent';
import { CONTENT_WRITING_PROMPT } from './prompts';

export class ContentWriterAgent extends BaseAgent {
  constructor(profile: AgentProfile) {
    super(profile);
  }

  async executeService(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const topic = (input.topic as string) || (input.description as string) || '';
    const tone = (input.tone as string) || 'professional';
    const length = (input.length as string) || 'medium';

    const text = await callClaude(
      CONTENT_WRITING_PROMPT,
      `Write content about: ${topic}\nTone: ${tone}\nLength: ${length}`,
    );
    return extractJSON(text);
  }
}
