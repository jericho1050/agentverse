import { Client, TopicMessageSubmitTransaction, TopicId, PrivateKey } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

// Load from .env.local
dotenv.config({ path: '.env.local' });
dotenv.config();

const agents = [
  {
    agentId: 'code-review',
    name: 'CodeGuard',
    capabilities: ['code-review', 'security-audit', 'typescript', 'solidity'],
    description: 'Expert code reviewer specializing in security audits and best practices for TypeScript and Solidity.',
    pricing: { currency: 'HBAR', basePrice: 0.5, unit: 'per-task' },
    accountIdEnv: 'AGENT_CODE_REVIEW_ACCOUNT_ID',
  },
  {
    agentId: 'data-analysis',
    name: 'DataMind',
    capabilities: ['data-analysis', 'statistics', 'visualization', 'insights'],
    description: 'Advanced data analyst providing statistical analysis, visualizations, and actionable insights.',
    pricing: { currency: 'HBAR', basePrice: 0.8, unit: 'per-task' },
    accountIdEnv: 'AGENT_DATA_ANALYSIS_ACCOUNT_ID',
  },
  {
    agentId: 'content-writer',
    name: 'WordSmith',
    capabilities: ['content-writing', 'copywriting', 'technical-writing', 'blog'],
    description: 'Professional content writer skilled in copywriting, technical documentation, and engaging blog posts.',
    pricing: { currency: 'HBAR', basePrice: 0.3, unit: 'per-task' },
    accountIdEnv: 'AGENT_CONTENT_WRITER_ACCOUNT_ID',
  },
];

async function seedAgents() {
  console.log('Registering agents on HCS Registry Topic...\n');

  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const registryTopicId = process.env.HCS_REGISTRY_TOPIC_ID;

  if (!operatorId || !operatorKey) {
    throw new Error('Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY');
  }
  if (!registryTopicId) {
    throw new Error('Missing HCS_REGISTRY_TOPIC_ID - run setup-topics.ts first');
  }

  const client = Client.forTestnet();
  client.setOperator(operatorId, PrivateKey.fromStringECDSA(operatorKey));

  for (const agent of agents) {
    const accountId = process.env[agent.accountIdEnv];

    const registrationMessage = {
      type: 'AGENT_REGISTER',
      version: '1.0',
      agentId: agent.agentId,
      name: agent.name,
      capabilities: agent.capabilities,
      description: agent.description,
      pricing: agent.pricing,
      accountId: accountId || 'not-configured',
      timestamp: Date.now(),
    };

    console.log(`Registering ${agent.name} (${agent.agentId})...`);

    const tx = new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(registryTopicId))
      .setMessage(new TextEncoder().encode(JSON.stringify(registrationMessage)));

    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);

    console.log(`  TX: ${response.transactionId.toString()}`);
    console.log(`  Sequence: ${receipt.topicSequenceNumber?.toNumber()}`);
    console.log(`  HashScan: https://hashscan.io/testnet/transaction/${response.transactionId.toString()}`);
    console.log('');
  }

  client.close();
  console.log('All agents registered on HCS! Check HashScan:');
  console.log(`https://hashscan.io/testnet/topic/${registryTopicId}`);
}

seedAgents().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
