import { callClaude } from './llm-client';
import { BaseAgent, AgentProfile, extractJSON } from './base-agent';
import { DATA_ANALYSIS_PROMPT } from './prompts';

export class DataAnalysisAgent extends BaseAgent {
  constructor(profile: AgentProfile) {
    super(profile);
  }

  async executeService(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const data = (input.data as string) || (input.description as string) || '';
    const text = await callClaude(
      DATA_ANALYSIS_PROMPT,
      `Analyze this data:\n\n${data}`,
    );
    return extractJSON(text);
  }
}
