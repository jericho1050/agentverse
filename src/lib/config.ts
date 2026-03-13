import { z } from 'zod';

const ConfigSchema = z.object({
  // AWS Bedrock
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),

  // Hedera Platform
  HEDERA_OPERATOR_ID: z.string().optional(),
  HEDERA_OPERATOR_KEY: z.string().optional(),

  // Network
  NEXT_PUBLIC_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),
  NEXT_PUBLIC_AGENT_MODE: z.enum(['autonomous', 'human']).default('human'),

  // Agent Accounts
  AGENT_CODE_REVIEW_ACCOUNT_ID: z.string().optional(),
  AGENT_CODE_REVIEW_PRIVATE_KEY: z.string().optional(),
  AGENT_DATA_ANALYSIS_ACCOUNT_ID: z.string().optional(),
  AGENT_DATA_ANALYSIS_PRIVATE_KEY: z.string().optional(),
  AGENT_CONTENT_WRITER_ACCOUNT_ID: z.string().optional(),
  AGENT_CONTENT_WRITER_PRIVATE_KEY: z.string().optional(),

  // HCS Topics
  HCS_REGISTRY_TOPIC_ID: z.string().optional(),
  HCS_NEGOTIATION_TOPIC_ID: z.string().optional(),
  HCS_REPUTATION_TOPIC_ID: z.string().optional(),

  // HTS Token
  AVT_TOKEN_ID: z.string().optional(),

  // Escrow Contract
  ESCROW_CONTRACT_EVM_ADDRESS: z.string().optional(),

  // Mirror Node
  MIRROR_NODE_URL: z.string().default('https://testnet.mirrornode.hedera.com/api/v1'),
});

type ConfigInput = z.infer<typeof ConfigSchema>;

export interface AgentConfig {
  id: string;
  accountId: string;
  privateKey: string;
  name: string;
}

export interface AppConfig {
  aws: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region: string;
  };
  hedera: {
    operatorId?: string;
    operatorKey?: string;
    network: 'testnet' | 'mainnet';
    mode: 'autonomous' | 'human';
  };
  agents: AgentConfig[];
  topics: {
    registry?: string;
    negotiation?: string;
    reputation?: string;
  };
  tokens: {
    avt?: string;
  };
  contracts: {
    escrowEvmAddress?: string;
  };
  mirrorNode: {
    url: string;
    baseUrl: string;
  };
}

function parseConfig(): ConfigInput {
  return ConfigSchema.parse({
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    HEDERA_OPERATOR_ID: process.env.HEDERA_OPERATOR_ID,
    HEDERA_OPERATOR_KEY: process.env.HEDERA_OPERATOR_KEY,
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_AGENT_MODE: process.env.NEXT_PUBLIC_AGENT_MODE,
    AGENT_CODE_REVIEW_ACCOUNT_ID: process.env.AGENT_CODE_REVIEW_ACCOUNT_ID,
    AGENT_CODE_REVIEW_PRIVATE_KEY: process.env.AGENT_CODE_REVIEW_PRIVATE_KEY,
    AGENT_DATA_ANALYSIS_ACCOUNT_ID: process.env.AGENT_DATA_ANALYSIS_ACCOUNT_ID,
    AGENT_DATA_ANALYSIS_PRIVATE_KEY: process.env.AGENT_DATA_ANALYSIS_PRIVATE_KEY,
    AGENT_CONTENT_WRITER_ACCOUNT_ID: process.env.AGENT_CONTENT_WRITER_ACCOUNT_ID,
    AGENT_CONTENT_WRITER_PRIVATE_KEY: process.env.AGENT_CONTENT_WRITER_PRIVATE_KEY,
    HCS_REGISTRY_TOPIC_ID: process.env.HCS_REGISTRY_TOPIC_ID,
    HCS_NEGOTIATION_TOPIC_ID: process.env.HCS_NEGOTIATION_TOPIC_ID,
    HCS_REPUTATION_TOPIC_ID: process.env.HCS_REPUTATION_TOPIC_ID,
    AVT_TOKEN_ID: process.env.AVT_TOKEN_ID,
    ESCROW_CONTRACT_EVM_ADDRESS: process.env.ESCROW_CONTRACT_EVM_ADDRESS,
    MIRROR_NODE_URL: process.env.MIRROR_NODE_URL,
  });
}

function buildAgentsArray(raw: ConfigInput): AgentConfig[] {
  const agents: AgentConfig[] = [];

  if (raw.AGENT_CODE_REVIEW_ACCOUNT_ID && raw.AGENT_CODE_REVIEW_PRIVATE_KEY) {
    agents.push({
      id: 'code-review',
      accountId: raw.AGENT_CODE_REVIEW_ACCOUNT_ID,
      privateKey: raw.AGENT_CODE_REVIEW_PRIVATE_KEY,
      name: 'Code Review Agent',
    });
  }

  if (raw.AGENT_DATA_ANALYSIS_ACCOUNT_ID && raw.AGENT_DATA_ANALYSIS_PRIVATE_KEY) {
    agents.push({
      id: 'data-analysis',
      accountId: raw.AGENT_DATA_ANALYSIS_ACCOUNT_ID,
      privateKey: raw.AGENT_DATA_ANALYSIS_PRIVATE_KEY,
      name: 'Data Analysis Agent',
    });
  }

  if (raw.AGENT_CONTENT_WRITER_ACCOUNT_ID && raw.AGENT_CONTENT_WRITER_PRIVATE_KEY) {
    agents.push({
      id: 'content-writer',
      accountId: raw.AGENT_CONTENT_WRITER_ACCOUNT_ID,
      privateKey: raw.AGENT_CONTENT_WRITER_PRIVATE_KEY,
      name: 'Content Writer Agent',
    });
  }

  return agents;
}

function getMirrorNodeBaseUrl(fullUrl: string): string {
  try {
    const url = new URL(fullUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return fullUrl;
  }
}

function buildConfig(): AppConfig {
  const raw = parseConfig();

  return {
    aws: {
      accessKeyId: raw.AWS_ACCESS_KEY_ID,
      secretAccessKey: raw.AWS_SECRET_ACCESS_KEY,
      region: raw.AWS_REGION,
    },
    hedera: {
      operatorId: raw.HEDERA_OPERATOR_ID,
      operatorKey: raw.HEDERA_OPERATOR_KEY,
      network: raw.NEXT_PUBLIC_NETWORK,
      mode: raw.NEXT_PUBLIC_AGENT_MODE,
    },
    agents: buildAgentsArray(raw),
    topics: {
      registry: raw.HCS_REGISTRY_TOPIC_ID,
      negotiation: raw.HCS_NEGOTIATION_TOPIC_ID,
      reputation: raw.HCS_REPUTATION_TOPIC_ID,
    },
    tokens: {
      avt: raw.AVT_TOKEN_ID,
    },
    contracts: {
      escrowEvmAddress: raw.ESCROW_CONTRACT_EVM_ADDRESS,
    },
    mirrorNode: {
      url: raw.MIRROR_NODE_URL,
      baseUrl: getMirrorNodeBaseUrl(raw.MIRROR_NODE_URL),
    },
  };
}

export const config: AppConfig = buildConfig();

export function validateConfig(): void {
  const errors: string[] = [];

  if (config.hedera.mode === 'autonomous') {
    if (!config.hedera.operatorId) {
      errors.push('HEDERA_OPERATOR_ID is required in autonomous mode');
    }
    if (!config.hedera.operatorKey) {
      errors.push('HEDERA_OPERATOR_KEY is required in autonomous mode');
    }
  }

  if (config.hedera.mode === 'autonomous' && config.agents.length === 0) {
    errors.push('At least one agent must be configured in autonomous mode');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}
