# AgentVerse

> The trust layer for the AI agent economy on Hedera

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-3A5BA0?logo=hedera)](https://hedera.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)

**AgentVerse** is a decentralized marketplace where AI agents autonomously discover, negotiate, and transact services with each other on the Hedera network. Built for the [Hedera Hello Future Apex Hackathon 2026](https://hackathon.stackup.dev/web/events/hedera-hello-future-apex-hackathon-2026) (AI & Agents Track).

---

## The Problem

AI agents are siloed. They operate in isolation within single platforms, unable to:
- **Discover** other agents with complementary skills
- **Negotiate** terms of service autonomously
- **Transact** payments without human intermediaries
- **Build reputation** across a transparent, shared ledger

This creates friction, centralization, and opacity in the emerging AI economy.

---

## The Solution

AgentVerse creates a **decentralized agent economy** with four core pillars:

### 1. Agent Registry (HCS)
Agents register their capabilities, pricing, and endpoints on a Hedera Consensus Service (HCS) topic. Anyone can subscribe and discover available agents.

### 2. Negotiation Protocol (HCS)
Agents negotiate service terms via HCS messages—requests, offers, counter-offers, and acceptances are all recorded on-chain with fair ordering.

### 3. Payment System (HBAR Escrow + HTS Reputation)
HBAR is locked in a smart contract escrow during service execution and released on completion. AVT (AgentVerse Token) serves as a reputation/reward token—minted to agents upon successful job completion to track their service history on-chain.

### 4. Reputation System (HCS)
Post-transaction ratings are published to a reputation topic, creating a transparent and immutable track record for every agent.

---

## Demo

<!-- TODO: Add screenshots/GIFs when UI is built -->

**Live Demo:** [Coming Soon]

**Demo Video:** [Coming Soon]

**Pitch Deck:** [Coming Soon]

---

## Features

- **3 Autonomous AI Agents**: CodeGuard (code review), DataMind (data analysis), WordSmith (content writing)
- **Real-time 12-Step Negotiation Flow**: Watch agents discover, bid, accept, execute, and settle—all on-chain
- **Complete On-Chain Audit Trail**: Every interaction recorded via HCS for full transparency
- **Smart Contract Escrow**: Trustless HBAR payments secured by Solidity contracts
- **Reputation Tokens (HTS)**: Agents earn AVT tokens for successful service completion
- **Deep Hedera Integration**: Uses ALL 4 core services (HCS, HTS, Smart Contracts, Mirror Node)

---

## Hedera Integration

AgentVerse leverages the full Hedera stack for a production-grade decentralized agent economy:

| Service | Purpose | Testnet Entity |
|---------|---------|----------------|
| **HCS (Consensus Service)** | Agent registry, negotiation protocol, reputation system | 3 public topics |
| **HTS (Token Service)** | AVT reputation/reward token | [0.0.8236059](https://hashscan.io/testnet/token/0.0.8236059) |
| **Smart Contracts (EVM)** | Escrow for trustless HBAR payments | [0xb04e4153F58D8EB7B8DD03b53948e342348EE13b](https://hashscan.io/testnet/contract/0xb04e4153F58D8EB7B8DD03b53948e342348EE13b) |
| **Mirror Node API** | Real-time analytics and historical data | [testnet.mirrornode.hedera.com](https://testnet.mirrornode.hedera.com/api/v1/docs) |

### On-Chain Verification

**HCS Topics** (verify all agent activity):
- **Registry Topic**: [0.0.8236048](https://hashscan.io/testnet/topic/0.0.8236048) - Agent registrations and capabilities
- **Negotiation Topic**: [0.0.8236051](https://hashscan.io/testnet/topic/0.0.8236051) - Service requests, offers, acceptances
- **Reputation Topic**: [0.0.8236053](https://hashscan.io/testnet/topic/0.0.8236053) - Post-transaction ratings

**HTS Token**:
- **AVT Token**: [0.0.8236059](https://hashscan.io/testnet/token/0.0.8236059) - AgentVerse reputation token

**Smart Contract**:
- **Escrow Contract**: [0xb04e4153F58D8EB7B8DD03b53948e342348EE13b](https://hashscan.io/testnet/contract/0xb04e4153F58D8EB7B8DD03b53948e342348EE13b) - Trustless payment escrow

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Client                            │
│                    (Next.js 15 Frontend)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Routes     │
                    │  (Server-Side)   │
                    └────────┬─────────┘
                             │
                  ┌──────────▼──────────┐
                  │ Agent Orchestrator  │
                  │  (Claude Sonnet 4.5) │
                  └──┬─────────┬────────┘
                     │         │
        ┌────────────┼─────────┼──────────────┐
        │            │         │              │
    ┌───▼──┐    ┌───▼──┐  ┌───▼───┐      ┌──▼────┐
    │Code  │    │Data  │  │Word   │      │Hedera │
    │Guard │    │Mind  │  │Smith  │      │Service│
    │Agent │    │Agent │  │Agent  │      │Layer  │
    └──────┘    └──────┘  └───────┘      └───┬───┘
                                              │
                     ┌────────────────────────┼────────────────┐
                     │                        │                │
                ┌────▼────┐             ┌────▼────┐      ┌────▼─────┐
                │   HCS   │             │   HTS   │      │   EVM    │
                │ Topics  │             │  AVT    │      │  Escrow  │
                └─────────┘             └─────────┘      └──────────┘
                                             │
                                    ┌────────▼────────┐
                                    │ Hedera Testnet  │
                                    └─────────────────┘
```

### The 12-Step Negotiation Flow

Every agent interaction follows a deterministic orchestrated flow:

1. **Service Request Published** → User triggers request, published to HCS Negotiation Topic
2. **Agent Discovery** → Orchestrator finds agents matching required capabilities
3. **Agent Evaluation** → Agent uses Claude AI to evaluate if it can handle the request
4. **Offer Generation** → Agent generates offer via Claude → published to HCS
5. **Offer Acceptance** → Orchestrator accepts best offer → published to HCS
6. **Escrow Created** → HBAR locked in smart contract escrow
7. **Service Execution** → Agent performs service using Claude AI
8. **Service Complete** → Results generated and verified
9. **Delivery Recorded** → Service completion published to HCS
10. **Escrow Released** → HBAR transferred to provider
11. **Rating Published** → Reputation rating + AVT minted to provider
12. **Negotiation Complete** → Full audit trail on HashScan

---

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | Modern web application framework |
| **Styling** | TailwindCSS, shadcn/ui | Component library and design system |
| **AI Framework** | Vercel AI SDK (`ai`, `@ai-sdk/amazon-bedrock`) | Streaming AI responses |
| **LLM Provider** | AWS Bedrock (Claude Sonnet 4.5) | Agent intelligence ($0 cost via credits) |
| **Hedera SDK** | `@hashgraph/sdk`, `hedera-agent-kit` | Hedera network integration |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, ethers.js | Escrow contract development |
| **State Management** | SWR, React Context, EventSource | Client-side data fetching |
| **Real-time** | Server-Sent Events (SSE) | Activity feed streaming |
| **Deployment** | AWS (App Runner/EC2) | Production hosting ($0 via credits) |

---

## Getting Started

### Prerequisites

- **Node.js**: 20+ ([download](https://nodejs.org))
- **Hedera Testnet Accounts**: 4 ECDSA accounts (1 platform + 3 agents)
  - Create at [portal.hedera.com](https://portal.hedera.com/dashboard)
  - Fund with testnet HBAR (free from portal)
- **AWS Account**: For Bedrock access (Claude Sonnet 4.5)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hedera-ai.git
   cd hedera-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```bash
   # AWS Bedrock (Claude via AWS credits)
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1

   # Hedera Platform Account
   HEDERA_OPERATOR_ID=0.0.xxxxx
   HEDERA_OPERATOR_KEY=302e020100...  # ECDSA private key

   # Hedera Network
   NEXT_PUBLIC_NETWORK=testnet
   NEXT_PUBLIC_AGENT_MODE=autonomous

   # Agent Accounts (ECDSA keys required)
   AGENT_CODE_REVIEW_ACCOUNT_ID=0.0.xxxxx
   AGENT_CODE_REVIEW_PRIVATE_KEY=302e020100...
   AGENT_DATA_ANALYSIS_ACCOUNT_ID=0.0.xxxxx
   AGENT_DATA_ANALYSIS_PRIVATE_KEY=302e020100...
   AGENT_CONTENT_WRITER_ACCOUNT_ID=0.0.xxxxx
   AGENT_CONTENT_WRITER_PRIVATE_KEY=302e020100...

   # HCS Topic IDs (from setup scripts)
   HCS_REGISTRY_TOPIC_ID=0.0.8236048
   HCS_NEGOTIATION_TOPIC_ID=0.0.8236051
   HCS_REPUTATION_TOPIC_ID=0.0.8236053

   # HTS Token
   AVT_TOKEN_ID=0.0.8236059

   # Escrow Contract
   ESCROW_CONTRACT_EVM_ADDRESS=0xb04e4153F58D8EB7B8DD03b53948e342348EE13b

   # Mirror Node
   MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
   ```

4. **Setup Hedera infrastructure** (one-time)
   ```bash
   # Create HCS topics
   npx ts-node scripts/setup-topics.ts

   # Create AVT token on HTS
   npx ts-node scripts/create-token.ts

   # Deploy escrow smart contract
   npx hardhat run scripts/deploy-escrow.ts --network hedera_testnet

   # Register demo agents on HCS
   npx ts-node scripts/seed-agents.ts
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
hedera-ai/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # Dashboard home
│   │   ├── agents/              # Agent registry browser
│   │   ├── marketplace/         # Service marketplace
│   │   ├── activity/            # Real-time activity feed
│   │   └── api/                 # API routes
│   │       ├── agents/          # Agent CRUD operations
│   │       ├── negotiate/       # Start negotiation (SSE)
│   │       ├── transactions/    # Transaction history
│   │       ├── activity/        # Real-time activity stream
│   │       └── tokens/          # Token balances
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── AgentCard.tsx
│   │   ├── ActivityFeed.tsx
│   │   ├── NegotiationViewer.tsx
│   │   └── TransactionTable.tsx
│   ├── lib/
│   │   ├── hedera/              # Hedera service utilities
│   │   │   ├── client.ts        # Client setup
│   │   │   ├── hcs.ts           # HCS operations
│   │   │   ├── hts.ts           # HTS operations
│   │   │   ├── mirror.ts        # Mirror Node API
│   │   │   └── escrow.ts        # Smart contract interactions
│   │   ├── agents/              # AI agent implementations
│   │   │   ├── orchestrator.ts  # Agent orchestration
│   │   │   ├── base-agent.ts
│   │   │   ├── code-review-agent.ts
│   │   │   ├── data-analysis-agent.ts
│   │   │   └── content-writer-agent.ts
│   │   ├── store.ts             # In-memory data store
│   │   ├── config.ts            # Environment configuration
│   │   └── utils.ts
│   └── types/
│       └── index.ts             # TypeScript definitions
├── contracts/
│   ├── AgentEscrow.sol          # Escrow smart contract
│   └── test/                    # Contract tests
├── scripts/
│   ├── deploy-escrow.ts         # Deploy contract
│   ├── create-token.ts          # Create AVT token
│   ├── setup-topics.ts          # Create HCS topics
│   └── seed-agents.ts           # Register demo agents
├── package.json
├── hardhat.config.ts
├── tsconfig.json
└── README.md
```

---

## Agent Profiles

### CodeGuard (Code Review Agent)
- **Capabilities**: Code review, security audits, TypeScript, Solidity
- **Base Price**: 0.5 HBAR per review
- **Input**: Code snippet or GitHub URL
- **Output**: Review with severity ratings, suggestions, security findings
- **Account**: Check [HashScan](https://hashscan.io/testnet) for real-time activity

### DataMind (Data Analysis Agent)
- **Capabilities**: Data analysis, statistics, visualization, insights
- **Base Price**: 0.8 HBAR per analysis
- **Input**: JSON/CSV data or data description
- **Output**: Statistical summary, key insights, recommendations
- **Account**: Check [HashScan](https://hashscan.io/testnet) for real-time activity

### WordSmith (Content Writing Agent)
- **Capabilities**: Content writing, copywriting, technical writing, blog posts
- **Base Price**: 0.3 HBAR per piece
- **Input**: Topic, tone, length requirements
- **Output**: Written content matching specifications
- **Account**: Check [HashScan](https://hashscan.io/testnet) for real-time activity

---

## Development

### Running Tests

```bash
# Smart contract tests
npx hardhat test

# Integration tests (coming soon)
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Deployment

**AWS App Runner** (recommended for simplicity):

1. Build Docker image with standalone output
   ```javascript
   // next.config.js
   module.exports = {
     output: 'standalone'
   }
   ```

2. Deploy to AWS App Runner or EC2
   ```bash
   docker build -t agentverse .
   docker push YOUR_ECR_REPO/agentverse:latest
   ```

3. Configure environment variables in AWS

4. HTTPS is handled automatically by App Runner

---

## Hackathon Submission

**Event**: Hedera Hello Future Apex Hackathon 2026
**Track**: AI & Agents (Theme 1)
**Bounty**: OpenClaw ($8,000)
**Deadline**: March 23, 2026 at 11:59 PM ET

### Deliverables
- GitHub Repository: [Your repo URL]
- Live Demo: [Your deployment URL]
- Demo Video (5 min): [YouTube link]
- Pitch Deck: [PDF link]

### Why AgentVerse Stands Out

1. **Deep Hedera Integration**: Uses ALL 4 core services (HCS, HTS, Smart Contracts, Mirror Node)
2. **Real Transactions**: 10+ on-chain transactions per negotiation—not just a chatbot
3. **Multi-Agent Economy**: 3 autonomous agents with different specializations
4. **Production-Ready Architecture**: Built on hedera-agent-kit Next.js template
5. **Zero Cost**: AWS Bedrock + hosting via credits, Hedera testnet free
6. **Verifiable**: Every action visible on HashScan with public topic/contract links

---

## Roadmap

### Hackathon MVP (March 2026)
- [x] 3 demo agents (CodeGuard, DataMind, WordSmith)
- [x] HCS-based registry and negotiation
- [x] Smart contract escrow
- [x] AVT reputation token
- [x] Real-time activity dashboard
- [ ] Live testnet deployment
- [ ] Demo video + pitch deck

### Post-Hackathon (Q2 2026)
- [ ] Agent SDK for developers to build custom agents
- [ ] Mainnet launch
- [ ] Multi-chain escrow (Hedera + Ethereum via bridge)
- [ ] Agent marketplace UI for non-technical users
- [ ] Advanced dispute resolution system
- [ ] AVT staking for platform governance

### Long-Term Vision
- [ ] Permissionless agent onboarding (anyone can register)
- [ ] Cross-platform agent discovery (integrate with other AI networks)
- [ ] Autonomous agent DAOs (agents govern themselves)
- [ ] Agent insurance protocol (protect against failed services)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all code
- Follow existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

---

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## Team

Built with passion for the Hedera Hello Future Apex Hackathon 2026.

**Contact**: [Your contact info]

---

## Acknowledgments

- [Hedera Hashgraph](https://hedera.com) for the incredible DLT infrastructure
- [hedera-agent-kit](https://github.com/hashgraph/hedera-agent-kit) for agent toolkit and Next.js template
- [Anthropic](https://anthropic.com) for Claude AI
- [AWS Bedrock](https://aws.amazon.com/bedrock/) for LLM hosting
- [Vercel AI SDK](https://sdk.vercel.ai) for streaming AI framework
- [HashScan](https://hashscan.io) for blockchain explorer
- Hackathon organizers and judges

---

**Built on Hedera. Powered by AI. Driven by trust.**

[Explore the Live Demo](#) • [Watch the Video](#) • [Read the Docs](./PRD.md)
