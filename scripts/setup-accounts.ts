import {
  Client,
  TokenAssociateTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  PrivateKey,
  AccountId,
  TokenId
} from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

interface AgentAccount {
  name: string;
  accountId: string;
  privateKey: string;
}

async function setupAccounts() {
  console.log('Setting up Agent Accounts with AVT Token...\n');

  try {
    // Load environment variables
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;
    const tokenId = process.env.AVT_TOKEN_ID;

    if (!operatorId || !operatorKey) {
      throw new Error('Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY in environment');
    }

    if (!tokenId) {
      throw new Error('Missing AVT_TOKEN_ID in environment. Run create-token.ts first.');
    }

    // Create client
    const client = Client.forTestnet();
    const operatorPrivateKey = PrivateKey.fromStringECDSA(operatorKey);
    client.setOperator(operatorId, operatorPrivateKey);

    // Load agent accounts from environment
    const agentDefs = [
      { name: 'Code Review', idVar: 'AGENT_CODE_REVIEW_ACCOUNT_ID', keyVar: 'AGENT_CODE_REVIEW_PRIVATE_KEY' },
      { name: 'Data Analysis', idVar: 'AGENT_DATA_ANALYSIS_ACCOUNT_ID', keyVar: 'AGENT_DATA_ANALYSIS_PRIVATE_KEY' },
      { name: 'Content Writer', idVar: 'AGENT_CONTENT_WRITER_ACCOUNT_ID', keyVar: 'AGENT_CONTENT_WRITER_PRIVATE_KEY' },
    ];

    const agentAccounts: AgentAccount[] = agentDefs
      .filter(d => process.env[d.idVar] && process.env[d.keyVar])
      .map(d => ({
        name: d.name,
        accountId: process.env[d.idVar]!,
        privateKey: process.env[d.keyVar]!,
      }));

    if (agentAccounts.length === 0) {
      throw new Error('No agent accounts found in environment.');
    }

    console.log(`Found ${agentAccounts.length} agent account(s) to set up`);
    console.log(`Token ID: ${tokenId}\n`);

    const avtTokenId = TokenId.fromString(tokenId);
    const distributionAmount = 10000; // 100.00 AVT with 2 decimals

    // Process each agent account
    for (const agent of agentAccounts) {
      console.log(`\n--- Setting up ${agent.name} (${agent.accountId}) ---`);

      try {
        const agentAccountId = AccountId.fromString(agent.accountId);
        const agentPrivateKey = PrivateKey.fromStringECDSA(agent.privateKey);

        // Step 1: Associate token with agent account
        console.log('Associating AVT token...');
        const associateTx = new TokenAssociateTransaction()
          .setAccountId(agentAccountId)
          .setTokenIds([avtTokenId])
          .freezeWith(client);

        const signedAssociateTx = await associateTx.sign(agentPrivateKey);
        const associateResponse = await signedAssociateTx.execute(client);
        await associateResponse.getReceipt(client);
        console.log('Token associated successfully');

        // Step 2: Transfer AVT from treasury to agent
        console.log(`Transferring ${distributionAmount / 100} AVT...`);
        const transferTx = new TransferTransaction()
          .addTokenTransfer(avtTokenId, operatorId, -distributionAmount)
          .addTokenTransfer(avtTokenId, agentAccountId, distributionAmount)
          .freezeWith(client);

        const transferResponse = await transferTx.execute(client);
        await transferResponse.getReceipt(client);
        console.log('Transfer completed successfully');

        // Step 3: Query and display balance
        const balance = await new AccountBalanceQuery()
          .setAccountId(agentAccountId)
          .execute(client);

        const avtBalance = balance.tokens?.get(avtTokenId);
        if (avtBalance) {
          console.log(`Current AVT Balance: ${avtBalance.toNumber() / 100} AVT`);
        }

      } catch (error) {
        console.error(`Failed to set up ${agent.name}:`, error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
        }
      }
    }

    // Display treasury balance
    console.log('\n--- Treasury Account ---');
    const treasuryBalance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    const treasuryAvt = treasuryBalance.tokens?.get(avtTokenId);
    if (treasuryAvt) {
      console.log(`Treasury (${operatorId}) AVT Balance: ${treasuryAvt.toNumber() / 100} AVT`);
    }

    client.close();
    console.log('\n=== Account setup complete! ===');

  } catch (error) {
    console.error('Error setting up accounts:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

setupAccounts();
