#!/usr/bin/env node
/**
 * Standalone LLM call script - runs outside Next.js webpack to avoid
 * AWS SDK RegExp OOM issue. Called by llm-client.ts via child_process.
 *
 * Input: JSON on stdin { system, prompt }
 * Output: Raw text response on stdout
 */
import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';

const MODEL = 'us.anthropic.claude-sonnet-4-5-20250929-v1:0';

async function main() {
  // Read JSON from stdin
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const { system, prompt } = JSON.parse(input);

  const client = new AnthropicBedrock({
    awsRegion: process.env.AWS_REGION || 'us-east-1',
  });

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: system || 'You are a helpful assistant.',
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  process.stdout.write(text);
}

main().catch(err => {
  process.stderr.write(`LLM Error: ${err.message}\n`);
  process.exit(1);
});
