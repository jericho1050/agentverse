import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai';
import { BaseAgent, AgentProfile } from './base-agent';
import { DATA_ANALYSIS_PROMPT } from './prompts';

const model = bedrock('us.anthropic.claude-sonnet-4-5-20250929-v1:0');

export class DataAnalysisAgent extends BaseAgent {
  constructor(profile: AgentProfile) {
    super(profile);
  }

  async executeService(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const data = (input.data as string) || (input.description as string) || '';
    const { text } = await generateText({
      model,
      system: DATA_ANALYSIS_PROMPT,
      prompt: `Analyze this data:\n\n${data}`,
    });
    return JSON.parse(text);
  }
}
