import { Client, TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import { config } from '@/lib/config';

export interface PublishMessageResult {
  transactionId: string;
  sequenceNumber: number;
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

/**
 * Publishes a JSON message to an HCS topic
 */
export async function publishMessage(
  topicId: string,
  message: object,
  client: Client
): Promise<PublishMessageResult> {
  try {
    const messageJson = JSON.stringify(message);
    const messageBytes = new TextEncoder().encode(messageJson);

    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicId))
      .setMessage(messageBytes);

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    return {
      transactionId: response.transactionId.toString(),
      sequenceNumber: receipt.topicSequenceNumber?.toNumber() || 0,
    };
  } catch (error) {
    throw new Error(
      `Failed to publish message to topic ${topicId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fetches messages from an HCS topic via Mirror Node
 */
export async function getTopicMessages(
  topicId: string,
  afterSequence?: number
): Promise<Array<{ sequence: number; timestamp: string; content: Record<string, unknown> }>> {
  try {
    const params = new URLSearchParams({
      limit: '25',
      order: 'asc',
    });

    if (afterSequence !== undefined) {
      params.set('sequencenumber', `gt:${afterSequence}`);
    }

    const url = `${config.mirrorNode.url}/api/v1/topics/${topicId}/messages?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Mirror Node API error: ${response.status} ${response.statusText}`);
    }

    const data: TopicMessagesResponse = await response.json();

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
  } catch (error) {
    throw new Error(
      `Failed to fetch messages from topic ${topicId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
