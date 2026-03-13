import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey
} from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createToken() {
  console.log('Creating AgentVerse Token (AVT) on Hedera Testnet...\n');

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

    console.log('Creating token with the following properties:');
    console.log('- Name: AgentVerse Token');
    console.log('- Symbol: AVT');
    console.log('- Decimals: 2');
    console.log('- Initial Supply: 100,000.00 AVT');
    console.log('- Max Supply: 1,000,000.00 AVT');
    console.log(`- Treasury: ${operatorId}\n`);

    // Create the token
    const transaction = new TokenCreateTransaction()
      .setTokenName('AgentVerse Token')
      .setTokenSymbol('AVT')
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(2)
      .setInitialSupply(100_000_00) // 100,000.00 AVT with 2 decimals
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1_000_000_00) // 1,000,000.00 AVT with 2 decimals
      .setSupplyKey(privateKey)
      .setAdminKey(privateKey);

    console.log('Submitting transaction...');
    const txResponse = await transaction.execute(client);

    console.log('Getting receipt...');
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    if (!tokenId) {
      throw new Error('Failed to create token - no token ID in receipt');
    }

    const tokenIdString = tokenId.toString();

    console.log('\n=== Token Created Successfully ===');
    console.log(`AVT_TOKEN_ID=${tokenIdString}`);
    console.log('\nHashScan Link:');
    console.log(`https://hashscan.io/testnet/token/${tokenIdString}`);
    console.log('\n=== Copy this to your .env.local file ===');
    console.log(`AVT_TOKEN_ID=${tokenIdString}`);
    console.log('========================================\n');

    client.close();
    console.log('Token creation complete!');

  } catch (error) {
    console.error('Error creating token:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

createToken();
