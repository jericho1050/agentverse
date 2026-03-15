import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { config } from '@/lib/config';

/**
 * Creates a Hedera client with the specified operator credentials
 */
export function createClient(accountId: string, privateKey: string): Client {
  const client = config.hedera.network === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

  client.setOperator(
    AccountId.fromString(accountId),
    PrivateKey.fromStringECDSA(privateKey)
  );

  return client;
}

/**
 * Gets the platform operator client
 */
export function getOperatorClient(): Client {
  if (!config.hedera.operatorId || !config.hedera.operatorKey) {
    throw new Error('Operator credentials not configured');
  }
  return createClient(config.hedera.operatorId, config.hedera.operatorKey);
}

/**
 * Gets a client for a specific agent
 */
export function getAgentClient(agentId: string): Client {
  const agent = config.agents.find(a => a.id === agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found in config`);
  }
  return createClient(agent.accountId, agent.privateKey);
}
