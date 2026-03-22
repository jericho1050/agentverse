import { execSync } from 'child_process';
import path from 'path';

/**
 * Calls Claude via a separate Node.js process to avoid webpack bundling
 * the AWS SDK (which causes RegExp OOM crashes).
 */
export async function callClaude(system: string, prompt: string): Promise<string> {
  const scriptPath = path.join(process.cwd(), 'scripts', 'llm-call.mjs');

  try {
    const input = JSON.stringify({ system, prompt });
    const result = execSync(
      `node "${scriptPath}"`,
      {
        input,
        encoding: 'utf-8',
        timeout: 120000, // 2 min for Opus 4.6
        env: { ...process.env },
        maxBuffer: 1024 * 1024,
      }
    );
    return result.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown LLM error';
    console.error('LLM call failed:', message);
    throw new Error(`LLM call failed: ${message}`);
  }
}
