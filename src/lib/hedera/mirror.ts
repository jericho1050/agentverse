import { config } from '@/lib/config';

export interface MirrorNodeBalance {
  balance: number;
  timestamp: string;
}

export interface MirrorNodeAccountResponse {
  account: string;
  balance: {
    balance: number;
    timestamp: string;
    tokens: Array<{
      token_id: string;
      balance: number;
      decimals: number;
    }>;
  };
}

export interface MirrorNodeTokenBalance {
  token_id: string;
  balance: number;
  decimals: number;
}

export interface MirrorNodeTransaction {
  transaction_id: string;
  consensus_timestamp: string;
  charged_tx_fee: number;
  memo_base64: string;
  result: string;
  name: string;
  transfers: Array<{
    account: string;
    amount: number;
  }>;
  token_transfers: Array<{
    token_id: string;
    account: string;
    amount: number;
  }>;
}

export interface TopicMessage {
  consensus_timestamp: string;
  topic_id: string;
  message: string;
  sequence_number: number;
  running_hash: string;
  running_hash_version: number;
  payer_account_id: string;
}

export interface TopicMessagesResponse {
  messages: TopicMessage[];
  links: {
    next: string | null;
  };
}

export interface GetTopicMessagesParams {
  afterSequence?: number;
  limit?: number;
}

/**
 * Base fetch function for Mirror Node API
 */
export async function fetchMirrorNode<T = Record<string, unknown>>(path: string): Promise<T> {
  const url = `${config.mirrorNode.url}${path}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Mirror Node API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Failed to fetch from Mirror Node: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Gets topic messages with optional filtering
 */
export async function getTopicMessages(
  topicId: string,
  params?: GetTopicMessagesParams
): Promise<Array<{ sequence: number; timestamp: string; content: Record<string, unknown> }>> {
  const searchParams = new URLSearchParams({
    limit: String(params?.limit || 25),
    order: 'asc',
  });

  if (params?.afterSequence !== undefined) {
    searchParams.set('sequencenumber', `gt:${params.afterSequence}`);
  }

  const data: TopicMessagesResponse = await fetchMirrorNode(
    `/topics/${topicId}/messages?${searchParams.toString()}`
  );

  return data.messages.map((msg) => {
    let content: Record<string, unknown>;
    try {
      const decodedMessage = atob(msg.message);
      content = JSON.parse(decodedMessage);
    } catch {
      content = { raw: atob(msg.message) };
    }

    return {
      sequence: msg.sequence_number,
      timestamp: msg.consensus_timestamp,
      content,
    };
  });
}

/**
 * Gets HBAR balance for an account
 * Returns balance in HBAR (not tinybars)
 */
export async function getAccountBalance(accountId: string): Promise<number> {
  const data: MirrorNodeAccountResponse = await fetchMirrorNode(`/accounts/${accountId}`);
  return data.balance.balance / 100_000_000; // Convert tinybars to HBAR
}

/**
 * Gets all token balances for an account
 */
export async function getAccountTokens(accountId: string): Promise<MirrorNodeTokenBalance[]> {
  const data: MirrorNodeAccountResponse = await fetchMirrorNode(`/accounts/${accountId}`);
  return data.balance.tokens;
}

/**
 * Gets transaction details by transaction ID
 */
export async function getTransactionRecord(transactionId: string): Promise<MirrorNodeTransaction> {
  const data: { transactions: MirrorNodeTransaction[] } = await fetchMirrorNode(
    `/transactions/${transactionId}`
  );

  if (!data.transactions || data.transactions.length === 0) {
    throw new Error(`Transaction not found: ${transactionId}`);
  }

  return data.transactions[0];
}
