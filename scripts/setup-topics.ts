import { Client, TopicCreateTransaction, PrivateKey } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface TopicConfig {
  memo: string;
  name: string;
  envVar: string;
}

const topics: TopicConfig[] = [
  {
    memo: 'AgentVerse Registry',
    name: 'Registry',
    envVar: 'HCS_REGISTRY_TOPIC_ID'
  },
  {
    memo: 'AgentVerse Negotiations',
    name: 'Negotiation',
    envVar: 'HCS_NEGOTIATION_TOPIC_ID'
  },
  {
    memo: 'AgentVerse Reputation',
    name: 'Reputation',
    envVar: 'HCS_REPUTATION_TOPIC_ID'
  }
];

async function setupTopics() {
  console.log('Setting up HCS Topics on Hedera Testnet...\n');

  try {
    // Load environment variables
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
      throw new Error('Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY in environment');
    }

    // Create client
    const client = Client.forTestnet();
    const privateKey = PrivateKey.fromStringECDSA(operatorKey);
    client.setOperator(operatorId, privateKey);

    const topicIds: string[] = [];

    // Create each topic
    for (const topic of topics) {
      console.log(`Creating ${topic.name} Topic...`);

      const transaction = new TopicCreateTransaction()
        .setTopicMemo(topic.memo);

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      const topicId = receipt.topicId;

      if (!topicId) {
        throw new Error(`Failed to create ${topic.name} topic`);
      }

      const topicIdString = topicId.toString();
      topicIds.push(topicIdString);

      console.log(`${topic.envVar}=${topicIdString}`);
      console.log(`Memo: ${topic.memo}\n`);
    }

    // Print all topic IDs for easy .env.local copying
    console.log('\n=== Copy these to your .env.local file ===');
    topics.forEach((topic, index) => {
      console.log(`${topic.envVar}=${topicIds[index]}`);
    });
    console.log('==========================================\n');

    client.close();
    console.log('Successfully created all HCS topics!');

  } catch (error) {
    console.error('Error setting up topics:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

setupTopics();
