import {
  Client,
  AccountId,
  TokenId,
  TransferTransaction,
  TokenMintTransaction,
  PrivateKey,
} from '@hashgraph/sdk';
import { config } from '@/lib/config';

const TOKEN_DECIMALS = 2; // AVT token has 2 decimals

export interface TokenBalance {
  token_id: string;
  balance: number;
  decimals: number;
}

export interface AccountTokensResponse {
  tokens: Array<{
    token_id: string;
    balance: number;
    decimals: number;
  }>;
}

/**
 * Transfers HTS tokens between accounts
 * Amount is in display units (will be multiplied by 10^decimals)
 */
export async function transferTokens(
  tokenId: string,
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  signerKey: string
): Promise<string> {
  try {
    const client = Client.forTestnet();
    const privateKey = PrivateKey.fromStringECDSA(signerKey);
    client.setOperator(AccountId.fromString(fromAccountId), privateKey);

    const rawAmount = Math.floor(amount * Math.pow(10, TOKEN_DECIMALS));

    const transaction = new TransferTransaction()
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(fromAccountId), -rawAmount)
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(toAccountId), rawAmount)
      .freezeWith(client);

    const signedTx = await transaction.sign(privateKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    client.close();

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
    }

    return response.transactionId.toString();
  } catch (error) {
    throw new Error(
      `Failed to transfer tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Gets token balance for an account from Mirror Node
 * Returns balance in display units
 */
export async function getTokenBalance(
  accountId: string,
  tokenId: string
): Promise<number> {
  try {
    const url = `${config.mirrorNode.url}/api/v1/accounts/${accountId}/tokens?token.id=${tokenId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Mirror Node API error: ${response.status} ${response.statusText}`);
    }

    const data: AccountTokensResponse = await response.json();

    if (data.tokens.length === 0) {
      return 0;
    }

    const token = data.tokens[0];
    return token.balance / Math.pow(10, token.decimals);
  } catch (error) {
    throw new Error(
      `Failed to get token balance: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Mints additional tokens (requires supply key)
 * Amount is in display units (will be multiplied by 10^decimals)
 */
export async function mintTokens(
  tokenId: string,
  amount: number,
  supplyKey: string
): Promise<string> {
  try {
    const client = Client.forTestnet();
    const privateKey = PrivateKey.fromStringECDSA(supplyKey);

    // For fungible tokens, we need to specify the amount
    const rawAmount = Math.floor(amount * Math.pow(10, TOKEN_DECIMALS));

    const transaction = new TokenMintTransaction()
      .setTokenId(TokenId.fromString(tokenId))
      .setAmount(rawAmount)
      .freezeWith(client);

    const signedTx = await transaction.sign(privateKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    client.close();

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Mint transaction failed with status: ${receipt.status.toString()}`);
    }

    return response.transactionId.toString();
  } catch (error) {
    throw new Error(
      `Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
