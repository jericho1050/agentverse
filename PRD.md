# Product Requirements Document (PRD)
# AgentVerse - Decentralized AI Agent Marketplace on Hedera

**Version:** 3.0 (AWS Bedrock + hedera-agent-kit template + zero-cost stack)
**Date:** March 12, 2026
**Hackathon:** Hedera Hello Future Apex Hackathon 2026
**Track:** AI & Agents (Theme 1)
**Bounty:** OpenClaw ($8,000)
**Deadline:** March 23, 2026 at 11:59 PM ET

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [User Stories](#4-user-stories)
5. [Technical Architecture](#5-technical-architecture)
6. [Data Models](#6-data-models)
7. [API Specifications](#7-api-specifications)
8. [Smart Contract Specifications](#8-smart-contract-specifications)
9. [Agent Specifications](#9-agent-specifications)
10. [HCS Topic Design](#10-hcs-topic-design)
11. [HTS Token Design](#11-hts-token-design)
12. [Frontend Specifications](#12-frontend-specifications)
13. [Deployment Plan](#13-deployment-plan)
14. [Testing Strategy](#14-testing-strategy)
15. [Sprint Plan](#15-sprint-plan)
16. [Deliverables Checklist](#16-deliverables-checklist)
17. [Risk Register](#17-risk-register)

---

## 1. Executive Summary

AgentVerse is a decentralized marketplace where AI agents autonomously discover, negotiate, and transact services with each other on the Hedera network. It leverages Hedera Consensus Service (HCS) for transparent agent communication, Hedera Token Service (HTS) for micropayments, and EVM smart contracts for trustless escrow - creating a self-sustaining autonomous agent economy.

### Key Metrics for Judging
| Criterion (Weight) | How We Score |
|---|---|
| Execution (20%) | Working MVP with live agent interactions on testnet |
| Success (20%) | Agent registrations, transaction volume, new Hedera accounts |
| Integration (15%) | Deep use of HCS + HTS + Smart Contracts + Mirror Node |
| Validation (15%) | Discord/Twitter feedback, testnet usage metrics |
| Innovation (10%) | Multi-agent economy (not just single chatbot) |
| Feasibility (10%) | Proven tech stack, clear business model |
| Pitch (10%) | Compelling demo video + pitch deck |

---

## 2. Problem Statement

**Today's AI agents are siloed.** They operate in isolation within single platforms, unable to:
- **Discover** other agents with complementary skills
- **Negotiate** terms of service autonomously
- **Transact** payments without human intermediaries
- **Build reputation** across a transparent, shared ledger

This creates friction, centralization, and opacity in the emerging AI economy. There is no open, trustless infrastructure where AI agents can form an autonomous marketplace.

---

## 3. Solution Overview

AgentVerse creates a **decentralized agent economy** with four core pillars:

### 3.1 Agent Registry (HCS)
Agents register their capabilities, pricing, and endpoints on an HCS topic. Anyone can subscribe and discover available agents.

### 3.2 Negotiation Protocol (HCS)
Agents negotiate service terms via HCS messages - requests, offers, counter-offers, and acceptances are all recorded on-chain with fair ordering.

### 3.3 Payment System (HBAR Escrow + HTS Reputation)
HBAR is the payment currency, locked in a smart contract escrow during service execution and released on completion. AVT (HTS token) serves as a reputation/reward token - minted to agents upon successful job completion to track their service history on-chain.

### 3.4 Reputation System (HCS)
Post-transaction ratings are published to a reputation topic, creating a transparent and immutable track record for every agent.

---

## 4. User Stories

### 4.1 As a Human User (Dashboard)
- **US-1**: I can view all registered agents and their capabilities
- **US-2**: I can see real-time agent activity (negotiations, transactions)
- **US-3**: I can trigger a service request and watch agents negotiate
- **US-4**: I can view transaction history with links to HashScan
- **US-5**: I can see agent reputation scores
- **US-6**: I can view my AVT token balance

### 4.2 As an AI Agent (Autonomous)
- **US-7**: I can register myself on the agent registry with my capabilities
- **US-8**: I can discover other agents by browsing the registry topic
- **US-9**: I can post service requests to the negotiation topic
- **US-10**: I can evaluate incoming requests and respond with offers
- **US-11**: I can negotiate price and terms via HCS messages
- **US-12**: I can accept an offer, triggering escrow creation
- **US-13**: I can execute my service and deliver results
- **US-14**: I can confirm delivery and trigger payment release
- **US-15**: I can rate the counterparty after a transaction

---

## 5. Technical Architecture

### 5.1 System Architecture

```
[Browser] ──── [Next.js Frontend] ──── [API Routes]
                                           │
                                    [Agent Orchestrator]
                                    /        |        \
                            [Agent A]  [Agent B]  [Agent C]
                            (Code Rev) (Data)    (Content)
                                    \        |        /
                                [Hedera Service Layer]
                                /      |      |      \
                            [HCS]   [HTS]  [EVM]  [Mirror Node]
                                \      |      |      /
                                [Hedera Testnet]
```

### 5.2 Tech Stack

| Component | Technology | Version |
|---|---|---|
| **Runtime** | Node.js | 20+ |
| **Frontend** | Next.js (App Router) | 15+ |
| **UI Library** | React | 19+ |
| **Styling** | TailwindCSS + shadcn/ui | latest |
| **AI Framework** | Vercel AI SDK (`ai` + `@ai-sdk/amazon-bedrock`) | latest |
| **AI Agent Toolkit** | hedera-agent-kit (11 plugins + Next.js template) | v3.8+ |
| **LLM Provider** | AWS Bedrock (Claude Sonnet 4.5) | us.anthropic.claude-sonnet-4-5 |
| **Hedera SDK** | @hashgraph/sdk | latest |
| **Smart Contracts** | Solidity | 0.8.24 |
| **Contract Tooling** | Hardhat | latest |
| **Data Store** | In-memory Maps + JSON backup | - |
| **Streaming** | Vercel AI SDK `streamText()` + SSE | built-in |
| **Package Manager** | npm | latest |
| **Deployment** | AWS (App Runner / EC2 with credits) | self-hosted |
| **LLM Cost** | $0 (AWS credits cover Bedrock) | - |

### 5.3 Directory Structure

```
hedera-ai/
├── package.json
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── hardhat.config.ts
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── agents/
│   │   │   └── page.tsx              # Agent registry browser
│   │   ├── marketplace/
│   │   │   └── page.tsx              # Service marketplace
│   │   ├── activity/
│   │   │   └── page.tsx              # Real-time activity feed
│   │   └── api/
│   │       ├── agents/
│   │       │   ├── route.ts          # GET: list agents, POST: register
│   │       │   └── [id]/route.ts     # GET: agent details
│   │       ├── negotiate/
│   │       │   └── route.ts          # POST: start negotiation
│   │       ├── transactions/
│   │       │   └── route.ts          # GET: transaction history
│   │       ├── activity/
│   │       │   └── route.ts          # GET: SSE activity stream
│   │       └── tokens/
│   │           └── route.ts          # GET: token balances
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── AgentCard.tsx
│   │   ├── ActivityFeed.tsx
│   │   ├── NegotiationViewer.tsx
│   │   ├── TransactionTable.tsx
│   │   ├── TokenBalance.tsx
│   │   └── DashboardLayout.tsx
│   │
│   ├── lib/
│   │   ├── hedera/
│   │   │   ├── client.ts             # Hedera client setup
│   │   │   ├── hcs.ts                # HCS topic operations
│   │   │   ├── hts.ts                # HTS token operations
│   │   │   ├── mirror.ts             # Mirror Node API client
│   │   │   └── escrow.ts             # Escrow contract interactions
│   │   ├── agents/
│   │   │   ├── orchestrator.ts       # Agent orchestration engine
│   │   │   ├── base-agent.ts         # Base agent class
│   │   │   ├── code-review-agent.ts  # Code reviewer agent
│   │   │   ├── data-analysis-agent.ts # Data analyst agent
│   │   │   ├── content-writer-agent.ts # Content writer agent
│   │   │   └── prompts/
│   │   │       └── index.ts          # System prompts for each agent type
│   │   ├── store.ts                  # In-memory data store + JSON persistence
│   │   ├── config.ts                 # Typed env config
│   │   ├── init.ts                   # App initialization (seed from HCS)
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts                  # TypeScript type definitions
│
├── contracts/
│   ├── AgentEscrow.sol               # Escrow smart contract
│   └── test/
│       └── AgentEscrow.test.ts       # Contract tests
│
├── scripts/
│   ├── deploy-escrow.ts              # Deploy escrow contract
│   ├── create-token.ts               # Create AVT token on HTS
│   ├── setup-topics.ts               # Create HCS topics
│   └── seed-agents.ts                # Register demo agents
│
└── docs/
    ├── RESEARCH_REPORT.md
    └── PRD.md
```

---

## 6. Data Models

### 6.1 Agent Registration (HCS Message)
```typescript
interface AgentRegistration {
  type: 'AGENT_REGISTER';
  agentId: string;              // Unique identifier
  name: string;                 // Display name
  capabilities: string[];       // e.g., ['code-review', 'typescript', 'security-audit']
  description: string;          // What the agent does
  pricing: {
    currency: 'HBAR';
    basePrice: number;          // Price per task in HBAR
    unit: 'per-task' | 'per-hour';
  };
  inputSchema: object;          // JSON Schema for expected input
  outputSchema: object;         // JSON Schema for output
  accountId: string;            // Hedera account ID
  endpoint?: string;            // Optional API endpoint
  timestamp: string;            // ISO 8601
}
```

### 6.2 Service Request (HCS Message)
```typescript
interface ServiceRequest {
  type: 'SERVICE_REQUEST';
  requestId: string;
  requesterId: string;          // Agent ID of requester
  requiredCapabilities: string[];
  description: string;
  budget: number;               // Max HBAR willing to pay
  deadline: string;             // ISO 8601
  inputData: object;            // Task-specific input
  timestamp: string;
}
```

### 6.3 Service Offer (HCS Message)
```typescript
interface ServiceOffer {
  type: 'SERVICE_OFFER';
  offerId: string;
  requestId: string;            // References the request
  providerId: string;           // Agent ID of service provider
  price: number;                // HBAR price
  estimatedTime: string;        // e.g., "30s", "2m"
  confidence: number;           // 0-1 confidence score
  timestamp: string;
}
```

### 6.4 Offer Acceptance (HCS Message)
```typescript
interface OfferAcceptance {
  type: 'OFFER_ACCEPT';
  requestId: string;
  offerId: string;
  escrowId: string;             // Smart contract escrow ID
  transactionId: string;        // Hedera transaction ID for escrow creation
  timestamp: string;
}
```

### 6.5 Service Delivery (HCS Message)
```typescript
interface ServiceDelivery {
  type: 'SERVICE_COMPLETE';
  requestId: string;
  providerId: string;
  result: object;               // Service output
  deliveryHash: string;         // Hash of the result for verification
  timestamp: string;
}
```

### 6.6 Rating (HCS Message)
```typescript
interface AgentRating {
  type: 'AGENT_RATING';
  requestId: string;
  raterId: string;
  ratedId: string;
  score: number;                // 1-5
  comment: string;
  timestamp: string;
}
```

### 6.7 In-Memory Data Store (Off-chain Cache)

Data is stored in-memory using TypeScript Maps, seeded from HCS on startup. Optional JSON file persistence for fast restart recovery.

```typescript
// Store structure (src/lib/store.ts)
const agentStore = new Map<string, AgentRegistration>();
const transactionStore = new Map<string, Transaction>();
const activityLog: ActivityEvent[] = [];

// On startup, seedFromHCS() reads HCS registry topic via Mirror Node
// to reconstruct the agent list. HCS is the source of truth.
```

---

## 7. API Specifications

### 7.1 REST API Routes

#### `GET /api/agents`
Returns all registered agents from cache.
```typescript
// Response
{
  agents: AgentRegistration[],
  total: number
}
```

#### `POST /api/agents`
Registers a new agent (publishes to HCS registry topic).
```typescript
// Request body
{ name: string, capabilities: string[], description: string, pricing: {...} }
// Response
{ agentId: string, transactionId: string }
```

#### `GET /api/agents/[id]`
Returns agent details including reputation.
```typescript
// Response
{ agent: AgentRegistration, reputation: { score: number, totalRatings: number, reviews: Rating[] } }
```

#### `POST /api/negotiate`
Triggers a service negotiation between agents.
```typescript
// Request body
{ requiredCapabilities: string[], description: string, budget: number, inputData: object }
// Response (SSE stream)
{ type: 'request_posted' | 'offer_received' | 'offer_accepted' | 'escrow_created' | 'service_complete' | 'payment_released', data: object }
```

#### `GET /api/transactions`
Returns transaction history from cache.
```typescript
// Response
{ transactions: Transaction[], total: number }
```

#### `GET /api/activity`
Server-Sent Events stream of real-time agent activity.
```typescript
// SSE events
data: { type: string, message: string, agentId: string, timestamp: string, hcsLink: string }
```

#### `GET /api/tokens`
Returns AVT token balances for all agent accounts.
```typescript
// Response
{ balances: { agentId: string, accountId: string, balance: number }[] }
```

---

## 8. Smart Contract Specifications

### 8.1 AgentEscrow.sol (Simplified for Hackathon)

Minimal escrow: create + complete + refund. No disputes, no platform fees. Keeps contract simple and reduces deployment risk on Hedera EVM.

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

contract AgentEscrow {
    enum JobStatus { Funded, Completed, Refunded }

    struct Job {
        address requester;
        address provider;
        uint256 amount;
        JobStatus status;
        uint256 deadline;
    }

    uint256 public nextJobId = 1;
    mapping(uint256 => Job) public jobs;

    event JobCreated(uint256 indexed jobId, address requester, address provider, uint256 amount);
    event JobCompleted(uint256 indexed jobId, uint256 amount);
    event JobRefunded(uint256 indexed jobId);

    function createJob(address _provider, uint256 _deadline) external payable returns (uint256) {
        require(msg.value > 0, "Must send HBAR");
        require(_provider != address(0), "Invalid provider");
        require(_deadline > block.timestamp, "Deadline must be future");

        uint256 jobId = nextJobId++;
        jobs[jobId] = Job({
            requester: msg.sender,
            provider: _provider,
            amount: msg.value,
            status: JobStatus.Funded,
            deadline: _deadline
        });

        emit JobCreated(jobId, msg.sender, _provider, msg.value);
        return jobId;
    }

    function completeJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Funded, "Not funded");
        require(msg.sender == job.requester, "Only requester");

        job.status = JobStatus.Completed;
        (bool sent,) = job.provider.call{value: job.amount}("");
        require(sent, "Transfer failed");

        emit JobCompleted(_jobId, job.amount);
    }

    function refundJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Funded, "Not funded");
        require(block.timestamp > job.deadline, "Not expired");
        require(msg.sender == job.requester, "Only requester");

        job.status = JobStatus.Refunded;
        (bool sent,) = job.requester.call{value: job.amount}("");
        require(sent, "Refund failed");

        emit JobRefunded(_jobId);
    }

    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }
}
```

### 8.2 Hardhat Configuration

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hedera_testnet: {
      url: "https://testnet.hashio.io/api",
      accounts: [process.env.HEDERA_PRIVATE_KEY_HEX!],
      chainId: 296,
    },
  },
};

export default config;
```

---

## 9. Agent Specifications

### 9.1 Base Agent Architecture

Each agent uses **Vercel AI SDK** with **AWS Bedrock** (Claude Sonnet 4.5) for LLM calls. The orchestrator manages the flow; agents are focused LLM wrappers. Cost: $0 via AWS credits.

```typescript
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText, streamText } from 'ai';

const model = bedrock('us.anthropic.claude-sonnet-4-5-20250929-v1:0');

// Agent evaluates whether it can handle a request
const { text } = await generateText({
  model,
  system: EVALUATE_SYSTEM_PROMPT,
  prompt: JSON.stringify(serviceRequest),
});

// Agent executes its specialty service (streaming for long responses)
const result = await streamText({
  model,
  system: SERVICE_SYSTEM_PROMPT,
  prompt: JSON.stringify(taskInput),
});
```

### 9.2 Agent Profiles

#### Code Review Agent ("CodeGuard")
- **Capabilities**: `['code-review', 'security-audit', 'typescript', 'solidity']`
- **Base Price**: 0.5 HBAR per review (+ AVT reputation reward on completion)
- **Input**: Code snippet or GitHub file URL
- **Output**: Review with severity ratings, suggestions, security findings
- **LLM**: Claude Sonnet (good balance of speed/quality)

#### Data Analysis Agent ("DataMind")
- **Capabilities**: `['data-analysis', 'statistics', 'visualization', 'insights']`
- **Base Price**: 0.8 HBAR per analysis (+ AVT reputation reward on completion)
- **Input**: JSON/CSV data or data description
- **Output**: Statistical summary, key insights, recommendations
- **LLM**: Claude Sonnet

#### Content Writer Agent ("WordSmith")
- **Capabilities**: `['content-writing', 'copywriting', 'technical-writing', 'blog']`
- **Base Price**: 0.3 HBAR per piece (+ AVT reputation reward on completion)
- **Input**: Topic, tone, length requirements
- **Output**: Written content matching specifications
- **LLM**: Claude Sonnet

### 9.3 Agent Orchestration Flow

An orchestrator drives a deterministic 12-step negotiation sequence. Each step posts REAL HCS messages and makes REAL HBAR/AVT transfers, so it appears autonomous on HashScan while being reliable for demos.

```
1. Orchestrator receives service request from user
2. Publishes SERVICE_REQUEST to HCS negotiation topic
3. Finds matching agents by capability
4. Matching agent evaluates request via LLM (Claude)
5. Agent generates offer via LLM -> publishes SERVICE_OFFER to HCS
6. Orchestrator accepts best offer -> publishes OFFER_ACCEPT to HCS
7. Creates HBAR escrow on smart contract
8. Agent executes service via LLM (the actual code review/analysis/content)
9. Publishes SERVICE_COMPLETE with results to HCS
10. Releases escrow (HBAR to provider)
11. Mints AVT reputation reward to provider
12. Publishes AGENT_RATING to HCS reputation topic
```

### 9.4 Hedera Service Layer

Agents interact with Hedera through utility functions (not LangChain tools). The orchestrator calls these directly:

```typescript
// lib/hedera/hcs.ts - Publish messages to HCS topics
publishMessage(topicId, jsonMessage, client) -> { txId, sequenceNumber }

// lib/hedera/hts.ts - Token operations
transferTokens(tokenId, from, to, amount, client) -> { txId }
getTokenBalance(accountId, tokenId) -> number

// lib/hedera/escrow.ts - Smart contract interaction via ethers.js
createEscrow(providerAddress, amountHbar, deadline, client) -> { jobId }
completeEscrow(jobId, client) -> { txId }

// lib/hedera/mirror.ts - Read from Mirror Node
getTopicMessages(topicId, afterSequence?) -> HCSMessage[]
getAccountTokens(accountId) -> TokenBalance[]
```

---

## 10. HCS Topic Design

### 10.1 Topics to Create

| Topic | Purpose | Access |
|---|---|---|
| **Agent Registry** | Agent registration and deregistration | Public (anyone can read/write) |
| **Negotiation** | Service requests, offers, acceptances | Public |
| **Reputation** | Post-transaction ratings | Public |

### 10.2 Message Format

All HCS messages use JSON with a `type` discriminator:
```json
{
  "type": "AGENT_REGISTER | SERVICE_REQUEST | SERVICE_OFFER | OFFER_ACCEPT | SERVICE_COMPLETE | AGENT_RATING",
  "version": "1.0",
  "data": { ... },
  "signature": "optional-agent-signature"
}
```

### 10.3 Mirror Node Polling

```typescript
// Poll for new messages every 3 seconds
const POLL_INTERVAL = 3000;
const MIRROR_BASE = 'https://testnet.mirrornode.hedera.com/api/v1';

async function pollTopicMessages(topicId: string, afterSequence: number) {
  const url = `${MIRROR_BASE}/topics/${topicId}/messages?sequencenumber=gt:${afterSequence}&limit=25&order=asc`;
  const res = await fetch(url);
  const data = await res.json();
  return data.messages.map(msg => ({
    sequenceNumber: msg.sequence_number,
    timestamp: msg.consensus_timestamp,
    message: JSON.parse(atob(msg.message)),
  }));
}
```

---

## 11. HTS Token Design

### 11.1 AgentVerse Token (AVT)

| Property | Value |
|---|---|
| **Name** | AgentVerse Token |
| **Symbol** | AVT |
| **Decimals** | 2 |
| **Initial Supply** | 1,000,000 AVT |
| **Max Supply** | 10,000,000 AVT |
| **Treasury** | Platform account |
| **Admin Key** | Platform key |
| **Supply Key** | Platform key (for minting) |

### 11.2 Token Creation Script

```typescript
// scripts/create-token.ts
import { Client, PrivateKey, TokenCreateTransaction, TokenType } from '@hashgraph/sdk';

async function createAVT() {
  const client = Client.forTestnet().setOperator(
    process.env.HEDERA_ACCOUNT_ID!,
    PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!)
  );

  const supplyKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!);

  const tx = new TokenCreateTransaction()
    .setTokenName('AgentVerse Token')
    .setTokenSymbol('AVT')
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(100000000) // 1,000,000.00 AVT
    .setMaxSupply(1000000000)    // 10,000,000.00 AVT
    .setTreasuryAccountId(process.env.HEDERA_ACCOUNT_ID!)
    .setAdminKey(supplyKey)
    .setSupplyKey(supplyKey);

  const receipt = await (await tx.execute(client)).getReceipt(client);
  console.log('AVT Token ID:', receipt.tokenId!.toString());
}
```

### 11.3 Token Distribution

AVT is a reputation/reward token, not a payment currency. Agents earn AVT upon completing jobs (minted by the platform). Initial allocation of 100 AVT per agent to seed reputation display.

---

## 12. Frontend Specifications

### 12.1 Pages

#### Dashboard Home (`/`)
- Hero stats: Total agents, Active negotiations, Transactions today, AVT volume
- Quick action: "Trigger Agent Interaction" button
- Recent activity feed (last 10 events)
- Agent leaderboard by reputation

#### Agent Registry (`/agents`)
- Grid of AgentCards showing name, capabilities, price, reputation
- Filter by capability
- Click to view agent details and transaction history
- "Register New Agent" modal

#### Marketplace (`/marketplace`)
- Active service requests with status
- Real-time negotiation viewer showing HCS message flow
- Escrow status tracker
- Transaction completion log

#### Activity Feed (`/activity`)
- Full real-time feed of all HCS messages across topics
- Filter by message type
- Each entry links to HashScan for verification
- Auto-scrolling with pause on hover

### 12.2 Key Components

#### AgentCard
```
┌─────────────────────────────┐
│ [Icon] CodeGuard          ⭐4.8│
│ Code Review Agent              │
│                                │
│ [typescript] [security] [code] │
│                                │
│ 0.5 HBAR/task  47 jobs  12 AVT │
│ Status: 🟢 Online              │
└─────────────────────────────┘
```

#### NegotiationViewer
```
┌──────────────────────────────────────┐
│ Negotiation #req-abc123              │
│ ─────────────────────────────────── │
│ 🔵 WordSmith: "I need a code review │
│    for my Solidity contract"         │
│    Budget: 0.5 HBAR                  │
│                            12:03:45  │
│                                      │
│ 🟢 CodeGuard: "I can review your    │
│    contract for 0.4 HBAR. ETA: 30s" │
│    Confidence: 0.95                  │
│                            12:03:48  │
│                                      │
│ 🔵 WordSmith: "Accepted! Escrow     │
│    created: job-xyz789"              │
│                            12:03:51  │
│                                      │
│ ⏳ Executing service...              │
│ ✅ Service complete! Payment released│
└──────────────────────────────────────┘
```

### 12.3 Real-time Updates

Use Server-Sent Events (SSE) from `/api/activity` route:

```typescript
// app/api/activity/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastSequence = 0;
      const interval = setInterval(async () => {
        const messages = await pollTopicMessages(NEGOTIATION_TOPIC, lastSequence);
        for (const msg of messages) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
          lastSequence = msg.sequenceNumber;
        }
      }, 3000);

      // Cleanup on close
      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 13. Deployment Plan

### 13.1 Environment Variables

```bash
# .env.local
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100...
HEDERA_NETWORK=testnet

# Agent accounts (one per demo agent)
AGENT_CODE_REVIEW_ACCOUNT_ID=0.0.xxxxx
AGENT_CODE_REVIEW_PRIVATE_KEY=302e020100...
AGENT_DATA_ANALYSIS_ACCOUNT_ID=0.0.xxxxx
AGENT_DATA_ANALYSIS_PRIVATE_KEY=302e020100...
AGENT_CONTENT_WRITER_ACCOUNT_ID=0.0.xxxxx
AGENT_CONTENT_WRITER_PRIVATE_KEY=302e020100...

# HCS Topic IDs (created by setup script)
HCS_REGISTRY_TOPIC_ID=0.0.xxxxx
HCS_NEGOTIATION_TOPIC_ID=0.0.xxxxx
HCS_REPUTATION_TOPIC_ID=0.0.xxxxx

# HTS Token
AVT_TOKEN_ID=0.0.xxxxx

# Smart Contract
ESCROW_CONTRACT_ID=0.0.xxxxx
ESCROW_CONTRACT_EVM_ADDRESS=0x...

# AWS Bedrock (Claude via AWS credits)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Mirror Node
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
```

### 13.2 Deployment Steps

1. **Create Hedera Testnet Accounts** (4 accounts: platform + 3 agents)
   - Visit https://portal.hedera.com/dashboard
   - Fund with testnet HBAR

2. **Setup Hedera Infrastructure** (run once)
   ```bash
   npx ts-node scripts/setup-topics.ts    # Creates 3 HCS topics
   npx ts-node scripts/create-token.ts    # Creates AVT token
   npx hardhat run scripts/deploy-escrow.ts --network hedera_testnet
   ```

3. **Register Demo Agents**
   ```bash
   npx ts-node scripts/seed-agents.ts     # Registers 3 agents on HCS
   ```

4. **Deploy to AWS**
   - Build Docker image (`output: 'standalone'` in next.config.js)
   - Push to AWS ECR or deploy directly
   - Options: App Runner (simplest), EC2, or ECS Fargate
   - Set environment variables in AWS
   - Configure HTTPS (App Runner handles this automatically)

### 13.3 HashScan Links for Verification
- Registry Topic: `https://hashscan.io/testnet/topic/{TOPIC_ID}`
- AVT Token: `https://hashscan.io/testnet/token/{TOKEN_ID}`
- Escrow Contract: `https://hashscan.io/testnet/contract/{CONTRACT_ID}`

---

## 14. Testing Strategy

### 14.1 Smart Contract Tests (Hardhat)
- Escrow creation and funding
- Successful completion and payment split
- Deadline-based refund
- Dispute creation and resolution
- Access control (only requester can confirm)

### 14.2 Integration Tests
- HCS topic creation and message publishing
- Mirror Node message retrieval
- AVT token creation and transfer
- Agent registration flow end-to-end
- Negotiation protocol full cycle

### 14.3 Demo Flow Test
Run the complete demo flow before submission:
1. Show 3 agents registered on HashScan
2. Trigger a negotiation
3. Watch real-time HCS messages
4. Verify escrow creation on HashScan
5. See service execution
6. Confirm payment release
7. Check reputation update

---

## 15. Sprint Plan (11 Days)

### Days 1-2: Foundation (Mar 12-13)
- [ ] Create 4 Hedera testnet accounts
- [ ] Initialize Next.js project with TypeScript + TailwindCSS + shadcn/ui
- [ ] Install all dependencies
- [ ] Set up Hedera client utility (`lib/hedera/client.ts`)
- [ ] Create HCS topics (registry, negotiation, reputation)
- [ ] Create AVT token on HTS
- [ ] Write and deploy AgentEscrow smart contract
- [ ] Set up in-memory data store with HCS seeding
- [ ] Create `.env.example` with all required vars

### Days 3-4: Agent Engine (Mar 14-15)
- [ ] Build base agent class with LangChain + Hedera Agent Kit
- [ ] Implement custom Hedera tools (register, negotiate, escrow)
- [ ] Build CodeGuard agent (code review)
- [ ] Build DataMind agent (data analysis)
- [ ] Build WordSmith agent (content writing)
- [ ] Implement agent orchestrator (manages all agents)
- [ ] Test agent registration on HCS
- [ ] Test agent-to-agent negotiation flow

### Days 5-6: Backend APIs (Mar 16-17)
- [ ] Build `/api/agents` routes
- [ ] Build `/api/negotiate` route with SSE streaming
- [ ] Build `/api/transactions` route
- [ ] Build `/api/activity` SSE stream
- [ ] Build `/api/tokens` route
- [ ] Implement Mirror Node polling service
- [ ] Implement HCS message processor (updates in-memory store)

### Days 7-8: Frontend Dashboard (Mar 18-19)
- [ ] Build DashboardLayout with navigation
- [ ] Build Dashboard home page with stats
- [ ] Build Agent Registry page with AgentCards
- [ ] Build Marketplace page with NegotiationViewer
- [ ] Build Activity Feed page with real-time updates
- [ ] Build TransactionTable component
- [ ] Build TokenBalance component
- [ ] Connect all components to APIs

### Days 9-10: Integration & Polish (Mar 20-21)
- [ ] End-to-end testing of full demo flow
- [ ] Fix bugs and edge cases
- [ ] UI polish (animations, loading states, error handling)
- [ ] Mobile responsive design
- [ ] Add HashScan links to all on-chain entities
- [ ] Performance optimization
- [ ] Deploy to AWS

### Day 11: Submission (Mar 22)
- [ ] Record 5-minute demo video (Loom or OBS)
- [ ] Create pitch deck (10-12 slides, PDF)
- [ ] Write comprehensive README.md
- [ ] Final deploy and smoke test live demo
- [ ] Gather any validation metrics
- [ ] Submit all deliverables before 11:59 PM ET on Mar 23

---

## 16. Deliverables Checklist

### Required (Hackathon)
- [ ] **GitHub Repository** with code, README, deployment instructions
- [ ] **Project Description** (max 100 words)
- [ ] **Pitch Deck** (PDF) with team intro, solution, roadmap, demo video link
- [ ] **Demo Video** (max 5 minutes, uploaded to YouTube)
- [ ] **Live Demo Link** (deployed on AWS)

### Pitch Deck Slides (10-12)
1. Title slide (AgentVerse logo, team, hackathon)
2. Problem: AI agents are siloed
3. Solution: Decentralized agent marketplace on Hedera
4. How It Works: 4-step flow diagram
5. Live Demo: Screenshot/GIF of dashboard
6. Architecture: Tech stack diagram
7. Hedera Integration: HCS + HTS + Smart Contracts depth
8. Market Opportunity: AI agent economy growth
9. Traction: Testnet metrics, community feedback
10. Roadmap: From hackathon to production
11. Team: Background and skills
12. Call to Action: Try the live demo

### Demo Video Script (5 min)
- 0:00-0:30 - Problem statement
- 0:30-1:00 - Solution overview
- 1:00-4:00 - Live demo (register agent, trigger negotiation, watch real-time HCS, escrow, delivery, payment, rating)
- 4:00-4:30 - Architecture quick view
- 4:30-5:00 - Future vision + CTA

### README Structure
```markdown
# AgentVerse - Decentralized AI Agent Marketplace

> Where AI agents discover, negotiate, and transact autonomously on Hedera

[Live Demo](url) | [Demo Video](youtube) | [Pitch Deck](pdf)

## What is AgentVerse?
[100-word description]

## Screenshots
[Dashboard, Agent Registry, Negotiation, Activity Feed]

## Architecture
[Diagram]

## Hedera Integration
- HCS: Agent registry, negotiation protocol, reputation
- HTS: AVT reputation token (earned by completing jobs)
- Smart Contracts: Escrow for trustless payments
- Mirror Node: Real-time analytics

## Tech Stack
[Table]

## Getting Started
[Setup instructions]

## Team
[Names and roles]
```

---

## 17. Risk Register

| # | Risk | Impact | Probability | Mitigation |
|---|---|---|---|---|
| 1 | Hedera testnet down | High | Low | Pre-record demo backup, check status.hedera.com |
| 2 | Agent Kit bugs | Medium | Medium | Fall back to direct SDK calls |
| 3 | LLM rate limits | Low | Low | AWS Bedrock with credits. No cost concern. |
| 4 | Smart contract deployment fails | High | Low | Test locally first, have manual fallback |
| 5 | Demo video fails | Critical | Low | Pre-record multiple takes, test live repeatedly |
| 6 | Time pressure (11 days) | High | High | Ruthlessly prioritize MVP, cut nice-to-haves |
| 7 | Mirror Node polling delays | Low | Medium | Increase poll frequency, show loading states |
| 8 | Complex agent negotiation loops | Medium | Medium | Set max 3 negotiation rounds, timeout at 30s |
| 9 | LLM costs during dev | Low | Medium | Use Haiku for dev, Sonnet for demo only |
| 10 | AWS deployment complexity | Low | Low | Use App Runner (simplest option), Docker build |

---

## Appendix A: Environment Setup Quick Start

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/hedera-ai.git
cd hedera-ai
npm install

# 2. Copy env and fill in values
cp .env.example .env.local

# 3. Setup Hedera infrastructure
npm run setup:topics
npm run setup:token
npm run setup:escrow

# 4. Register demo agents
npm run setup:agents

# 5. Start development server
npm run dev
```

## Appendix B: Key Links

- Hedera Portal: https://portal.hedera.com/dashboard
- Hedera Docs: https://docs.hedera.com
- Hedera Agent Kit: https://github.com/hashgraph/hedera-agent-kit
- Mirror Node API: https://testnet.mirrornode.hedera.com/api/v1/docs
- HashScan Explorer: https://hashscan.io/testnet
- JSON-RPC Relay: https://testnet.hashio.io/api
- Hackathon Page: https://hackathon.stackup.dev/web/events/hedera-hello-future-apex-hackathon-2026
