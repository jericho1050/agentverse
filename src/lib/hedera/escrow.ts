import { ethers } from 'ethers';
import { config } from '@/lib/config';

const RPC_URL = 'https://testnet.hashio.io/api';
const CHAIN_ID = 296;

const ESCROW_ABI = [
  'function createJob(address _provider, uint256 _deadline) external payable returns (uint256)',
  'function completeJob(uint256 _jobId) external',
  'function getJob(uint256 _jobId) external view returns (tuple(address requester, address provider, uint256 amount, uint8 status, uint256 deadline))',
  'function nextJobId() external view returns (uint256)',
  'event JobCreated(uint256 indexed jobId, address requester, address provider, uint256 amount)',
  'event JobCompleted(uint256 indexed jobId, uint256 amount)',
];

function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: 'hedera-testnet',
    ensAddress: undefined, // Hedera doesn't support ENS
  });
}

function getSignerWallet(privateKey: string) {
  return new ethers.Wallet(privateKey, getProvider());
}

function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!config.contracts.escrowEvmAddress) {
    throw new Error('Escrow contract address not configured');
  }
  return new ethers.Contract(config.contracts.escrowEvmAddress, ESCROW_ABI, signerOrProvider);
}

export interface EscrowJob {
  requester: string;
  provider: string;
  amount: bigint;
  status: number; // 0=Funded, 1=Completed, 2=Refunded
  deadline: bigint;
}

/**
 * Creates an escrow job by sending HBAR to the contract.
 * The caller (requester) must provide their private key.
 * Returns the job ID and transaction hash.
 */
export async function createEscrow(
  requesterPrivateKey: string,
  providerEvmAddress: string,
  amountHbar: number,
  deadlineSeconds: number = 3600
): Promise<{ jobId: number; txHash: string }> {
  const wallet = getSignerWallet(requesterPrivateKey);
  const contract = getContract(wallet);

  const deadline = Math.floor(Date.now() / 1000) + deadlineSeconds;
  // On Hedera EVM, HBAR uses 8 decimals (tinybars), not 18
  // 1 HBAR = 100,000,000 tinybar = 10^8 tinybar
  const value = ethers.parseUnits(amountHbar.toString(), 8);

  const tx = await contract.createJob(providerEvmAddress, deadline, { value, gasLimit: 300000 });
  const receipt = await tx.wait();

  // Extract jobId from the JobCreated event
  let jobId = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: [...log.topics], data: log.data });
      if (parsed && parsed.name === 'JobCreated') {
        jobId = Number(parsed.args[0]);
        break;
      }
    } catch { /* skip non-matching logs */ }
  }

  return { jobId, txHash: receipt.hash };
}

/**
 * Completes an escrow job, releasing HBAR to the provider.
 * Must be called by the original requester.
 */
export async function completeEscrow(
  requesterPrivateKey: string,
  jobId: number
): Promise<{ txHash: string }> {
  const wallet = getSignerWallet(requesterPrivateKey);
  const contract = getContract(wallet);

  const tx = await contract.completeJob(jobId, { gasLimit: 300000 });
  const receipt = await tx.wait();

  return { txHash: receipt.hash };
}

/**
 * Reads the current state of an escrow job.
 */
export async function getEscrowJob(jobId: number): Promise<EscrowJob> {
  const contract = getContract(getProvider());
  const job = await contract.getJob(jobId);

  return {
    requester: job[0],
    provider: job[1],
    amount: job[2],
    status: Number(job[3]),
    deadline: job[4],
  };
}
