# MediVerify

> AI-powered medical record verification on Hedera blockchain

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-3A5BA0?logo=hedera)](https://hedera.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Claude](https://img.shields.io/badge/Claude-Opus%204.6-orange?logo=anthropic)](https://www.anthropic.com)
[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)

**MediVerify** is an AI-powered platform that verifies medical documents and creates immutable, shareable verification records on the Hedera network. Built for the [Hedera Hello Future Apex Hackathon 2026](https://hackathon.stackup.dev/web/events/hedera-hello-future-apex-hackathon-2026) (Open Track - Theme 4: Healthcare).

**Live Demo:** [https://mediverify.my](https://mediverify.my)
**Demo Video:** [https://www.youtube.com/watch?v=TPz5t4BIFE4](https://www.youtube.com/watch?v=TPz5t4BIFE4)
**GitHub:** [https://github.com/jericho1050/agentverse](https://github.com/jericho1050/agentverse)

---

## The Problem

Healthcare providers face critical challenges with patient medical records:

- **Incomplete Documentation**: Missing lab results, medications, or diagnoses delay care
- **Inconsistent Data**: Conflicting information across multiple providers creates confusion
- **Verification Burden**: Doctors spend valuable time validating patient-submitted documents
- **Fraud & Errors**: Altered prescriptions or forged documents pose serious safety risks
- **No Audit Trail**: Once a document changes hands, there's no provable verification history

Patients waste time gathering records. Doctors waste time validating them. **Everyone loses.**

---

## The Solution

MediVerify combines **Claude Opus 4.6 AI** with **Hedera's distributed ledger** to create a trusted verification layer for medical documents.

### How It Works (6-Step Flow)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Patient    │────▶│   AI Agent   │────▶│   Hedera     │
│   Uploads    │     │  Analyzes    │     │  Timestamps  │
│  Med Docs    │     │  Document    │     │  Validation  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                                   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Doctor     │◀────│   Patient    │◀────│  Token Mint  │
│  Verifies    │     │   Shares     │     │  (MVT/HTS)   │
│ on HashScan  │     │ Proof Link   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### What MediVerify Does

1. **Document Upload**: Patient submits medical records (lab results, prescriptions, discharge summaries) in PDF, TXT, or CSV format
2. **AI Analysis**: Claude Opus 4.6 verifies completeness, detects inconsistencies, flags red flags
3. **HCS Timestamp**: Verification result stamped immutably on Hedera Consensus Service
4. **Token Issuance**: MediVerify Token (MVT) minted to patient's account via Hedera Token Service
5. **Shareable Proof**: Patient receives HashScan link showing verified record on-chain
6. **Doctor Validation**: Healthcare provider verifies authenticity by checking Hedera timestamp

### Key Features

- **AI-Powered Validation**: Claude analyzes medical terminology, dates, dosages, and document structure
- **Immutable Audit Trail**: Every verification recorded on HCS with microsecond-precision timestamps
- **Reputation Tokens**: MVT tokens track patient verification history (HTS fungible token)
- **Health Passport**: Generate portable digital health records with QR code sharing
- **QR Code Sharing**: Share verification proof via scannable QR codes
- **Data Persistence**: Verification records persist across server restarts (JSON file storage)
- **Zero-Knowledge Sharing**: Share verification proof without exposing sensitive medical data
- **Cross-Provider Trust**: Doctors across institutions can trust Hedera-stamped verifications
- **Escrow Security**: Optional payment escrow for premium verification services (EVM smart contract)

---

## Hedera Integration

MediVerify demonstrates production-grade use of **4 Hedera services** for healthcare innovation:

| Service | Purpose | Testnet Entity |
|---------|---------|----------------|
| **HCS (Consensus Service)** | Timestamp verification results with fair ordering and immutability | [0.0.8236051](https://hashscan.io/testnet/topic/0.0.8236051) |
| **HTS (Token Service)** | Mint MVT reputation tokens to verified patients | [0.0.8236059](https://hashscan.io/testnet/token/0.0.8236059) |
| **Smart Contracts (EVM)** | Escrow HBAR for premium verification services | [0xb04e4153F58D8EB7B8DD03b53948e342348EE13b](https://hashscan.io/testnet/contract/0xb04e4153F58D8EB7B8DD03b53948e342348EE13b) |
| **Mirror Node API** | Query verification history and token balances | [testnet.mirrornode.hedera.com](https://testnet.mirrornode.hedera.com/api/v1/docs) |

### On-Chain Verification

**HCS Verification Topic**: [0.0.8236051](https://hashscan.io/testnet/topic/0.0.8236051)
View every medical document verification in real-time. Each HCS message contains:
- Document hash (SHA-256)
- AI verification result (complete/incomplete/flagged)
- Timestamp (consensus-ordered, tamper-proof)
- Patient account ID

**Current Stats**:
- **27+ HCS verification messages** on testnet topic 0.0.8236051
- **12+ MVT tokens minted** on HTS token 0.0.8236059
- **7 documents verified**, average score 84/100
- **10+ diverse medical document types tested**

**MVT Token**: [0.0.8236059](https://hashscan.io/testnet/token/0.0.8236059)
MediVerify Token (MVT) is minted to patients upon successful document verification. Check your verification count by viewing your account on HashScan.

**Escrow Contract**: [0xb04e4153F58D8EB7B8DD03b53948e342348EE13b](https://hashscan.io/testnet/contract/0xb04e4153F58D8EB7B8DD03b53948e342348EE13b)
Solidity smart contract securing HBAR payments for premium AI verification services. Funds released only after verification completion.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      Patient Browser                           │
│                   (Next.js 15 Frontend)                        │
│                                                                │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │  Upload  │   │  Status  │   │ Passport │   │  History │  │
│  │   Docs   │   │  Monitor │   │  + QR    │   │  Tokens  │  │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘  │
└─────────────────────────┬──────────────────────────────────────┘
                          │
                ┌─────────▼─────────┐
                │   API Routes      │
                │  (Server-Side)    │
                └─────────┬─────────┘
                          │
            ┌─────────────▼─────────────┐
            │  AI Verification Engine   │
            │  (Claude Opus 4.6 via   │
            │   AWS Bedrock SDK)        │
            └─────────────┬─────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    ┌───▼────┐       ┌────▼────┐      ┌────▼────┐
    │  HCS   │       │   HTS   │      │   EVM   │
    │ Topic  │       │   MVT   │      │ Escrow  │
    │0.0.XXX │       │ Token   │      │Contract │
    └────────┘       └─────────┘      └─────────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
                ┌─────────▼──────────┐
                │  Hedera Testnet    │
                │  (Mirror Node API) │
                └────────────────────┘
```

### The 6-Step Verification Flow

1. **Document Upload**
   Patient uploads medical document (PDF, TXT, or CSV). Document is parsed and sanitized.

2. **AI Analysis**
   Claude Opus 4.6 analyzes the document for:
   - Completeness (all required fields present)
   - Consistency (dates, dosages, terminology align)
   - Red flags (unusual patterns, potential errors)

3. **HCS Timestamp**
   Verification result + document hash published to HCS topic. Consensus timestamp proves authenticity.

4. **Token Mint**
   MVT token minted to patient's Hedera account via HTS. Token tracks verification history.

5. **Shareable Link**
   Patient receives HashScan URL pointing to HCS message. No sensitive data exposed.

6. **Doctor Validation**
   Healthcare provider clicks link, sees Hedera-stamped verification result, trusts authenticity.

---

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | Modern web application framework |
| **Styling** | TailwindCSS, shadcn/ui | Component library and design system |
| **AI Provider** | AWS Bedrock (Claude Opus 4.6) | Medical document analysis ($0 via credits) |
| **AI SDK** | `@anthropic-ai/bedrock-sdk` | Native Claude integration with Bedrock |
| **Blockchain** | `@hashgraph/sdk` | Hedera network integration (HCS, HTS, contracts) |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, ethers.js | Escrow contract for payments |
| **State Management** | React Context, SWR | Client-side data fetching |
| **PDF Processing** | `pdf-parse` | PDF text extraction for verification |
| **QR Codes** | `qrcode` | QR code generation for health passport sharing |
| **Deployment** | AWS EC2, IAM Instance Roles | Production hosting with Bedrock access ($0 via credits) |

---

## Getting Started

### Prerequisites

- **Node.js**: 20+ ([download](https://nodejs.org))
- **Hedera Testnet Account**: Create at [portal.hedera.com](https://portal.hedera.com/dashboard)
  - Fund with testnet HBAR (free from portal)
- **AWS Account**: For Bedrock access (Claude Opus 4.6)
  - Request Bedrock access in us-east-1 region
  - Enable Claude Opus 4.6 model (or Claude Sonnet 4.5 as fallback)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jericho1050/agentverse.git
   cd agentverse
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
   # AWS Bedrock (Claude Opus 4.6 or Sonnet 4.5)
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1

   # Hedera Platform Account
   HEDERA_OPERATOR_ID=0.0.xxxxx
   HEDERA_OPERATOR_KEY=302e020100...  # ECDSA private key

   # Hedera Network
   NEXT_PUBLIC_NETWORK=testnet

   # HCS Verification Topic
   HCS_VERIFICATION_TOPIC_ID=0.0.8236051

   # HTS Token
   MVT_TOKEN_ID=0.0.8236059

   # Escrow Contract
   ESCROW_CONTRACT_EVM_ADDRESS=0xb04e4153F58D8EB7B8DD03b53948e342348EE13b

   # Mirror Node
   MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
   ```

4. **Setup Hedera infrastructure** (one-time)
   ```bash
   # Create HCS verification topic
   npx ts-node scripts/setup-topic.ts

   # Create MVT token on HTS
   npx ts-node scripts/create-token.ts

   # Deploy escrow smart contract
   npx hardhat run scripts/deploy-escrow.ts --network hedera_testnet
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Usage Example

### For Patients

1. **Upload Medical Document**
   - Click "Upload Document" button
   - Select lab result, prescription, or discharge summary (PDF, TXT, or CSV)
   - Submit for AI verification

2. **Wait for AI Analysis**
   - Claude analyzes document (5-10 seconds)
   - Verification result displayed in real-time

3. **Receive Verification Proof**
   - HCS topic link on HashScan
   - MVT token minted to your account
   - Access Health Passport at `/passport` page
   - Share via QR code or direct link with your doctor

### For Doctors

1. **Receive HashScan Link**
   - Patient shares verification link
   - Click to view on HashScan

2. **Verify Authenticity**
   - Check HCS timestamp (consensus-ordered)
   - Review AI verification result
   - Trust Hedera-stamped proof

3. **Proceed with Care**
   - No need to re-validate document
   - Focus on patient treatment

---

## Project Structure

```
hedera-ai/
├── src/
│   ├── app/                        # Next.js 15 App Router
│   │   ├── page.tsx                # Dashboard with stats + CTA
│   │   ├── verify/page.tsx         # Main verification page (upload + SSE progress)
│   │   ├── records/page.tsx        # Verified documents grid
│   │   ├── passport/page.tsx       # Health Passport with circular score + QR
│   │   ├── activity/page.tsx       # Real-time HCS message feed (EventSource)
│   │   ├── share/[id]/page.tsx     # Public verification proof page
│   │   └── api/
│   │       ├── verify/route.ts     # POST: SSE stream for 6-step verification
│   │       ├── documents/route.ts  # GET: verified documents list
│   │       ├── stats/route.ts      # GET: verification statistics
│   │       ├── share/[id]/route.ts # GET: verification proof by ID
│   │       ├── activity/route.ts   # GET: SSE activity feed
│   │       ├── recent-activity/route.ts # GET: JSON recent activity
│   │       ├── qr/route.ts        # GET: QR code SVG generator
│   │       └── parse-file/route.ts # POST: PDF/text file parsing
│   ├── components/
│   │   ├── DashboardLayout.tsx     # Sidebar navigation, emerald theme
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── orchestrator.ts     # 6-step verification async generator
│   │   │   ├── llm-client.ts      # Child process LLM caller (avoids webpack OOM)
│   │   │   └── prompts.ts         # Medical document analysis prompts
│   │   ├── hedera/
│   │   │   ├── client.ts          # Hedera client factory
│   │   │   ├── hcs.ts             # HCS publish + Mirror Node queries
│   │   │   ├── hts.ts             # HTS token transfer + balance
│   │   │   ├── escrow.ts          # EVM escrow contract via ethers.js
│   │   │   └── mirror.ts          # Generic Mirror Node REST client
│   │   ├── store.ts               # globalThis store + JSON file persistence
│   │   ├── config.ts              # Typed env config with Zod validation
│   │   └── utils.ts
│   └── types/index.ts             # TypeScript definitions
├── contracts/
│   └── AgentEscrow.sol            # Minimal escrow (create/complete/refund)
├── scripts/
│   ├── llm-call.mjs              # Standalone Bedrock LLM (runs outside webpack)
│   ├── setup-topics.ts           # Create HCS topics
│   ├── create-token.ts           # Create MVT token on HTS
│   ├── deploy-escrow.ts          # Deploy escrow contract
│   ├── seed-agents.ts            # Register agents on HCS
│   ├── setup-accounts.ts         # Setup Hedera accounts
│   └── run-verifications.sh      # Run batch verification tests
├── hardhat.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## AI Verification Logic

MediVerify uses **Claude Opus 4.6** to analyze medical documents across multiple dimensions:

### Completeness Check
- Patient name, date of birth, medical record number
- Provider name, facility, contact information
- Document type (lab result, prescription, etc.)
- Date of service, test results, diagnoses
- Signatures, credentials, license numbers

### Consistency Check
- Date alignment (service date ≤ document date)
- Dosage format (valid units, ranges)
- Medical terminology (correct spelling, abbreviations)
- Cross-field validation (diagnosis matches prescribed medication)

### Red Flag Detection
- Unusual patterns (e.g., dosage out of typical range)
- Missing critical fields (e.g., no provider signature)
- Inconsistent formatting (potential tampering)
- Expired documents (old test results presented as recent)

### Output Format

```json
{
  "status": "verified",
  "completeness": 0.95,
  "consistency": 0.92,
  "redFlags": [],
  "summary": "Lab results complete with all required fields. No inconsistencies detected.",
  "timestamp": "2026-03-20T15:30:00Z",
  "documentHash": "sha256:abc123..."
}
```

---

## Hackathon Submission

**Event**: Hedera Hello Future Apex Hackathon 2026
**Track**: Open Track (Theme 4: Healthcare)
**Deadline**: March 23, 2026 at 11:59 PM ET
**Prize Pool**: $120,000 total

### Deliverables
- GitHub Repository: [https://github.com/jericho1050/agentverse](https://github.com/jericho1050/agentverse)
- Live Demo: [https://mediverify.my](https://mediverify.my)
- Demo Video: [https://www.youtube.com/watch?v=TPz5t4BIFE4](https://www.youtube.com/watch?v=TPz5t4BIFE4)
- Pitch Deck: included in repo (PDF)

### Why MediVerify Stands Out

1. **Real-World Healthcare Impact**: Solves actual problem doctors and patients face daily
2. **Deep Hedera Integration**: Uses 4 core services (HCS, HTS, Smart Contracts, Mirror Node)
3. **AI + Blockchain Synergy**: Claude provides intelligence, Hedera provides trust
4. **Production-Ready Architecture**: Built on battle-tested Next.js + Hedera SDK
5. **Zero Cost to Operate**: AWS credits for Bedrock + hosting, Hedera testnet free
6. **Verifiable on HashScan**: Every verification publicly auditable with proof links
7. **Privacy-Preserving**: Share verification proof without exposing sensitive medical data

### Key Metrics (Current)
- **27+ HCS verification messages** on testnet topic 0.0.8236051
- **12+ MVT tokens minted** on HTS token 0.0.8236059
- **7 documents verified**, average score 84/100
- **10+ diverse medical document types tested**
- **100% uptime** on HCS topic
- **Sub-10-second verification latency**
- **Data persistence** across server restarts
- **AWS EC2** with IAM instance role for permanent Bedrock access

---

## Development

### Running Tests

```bash
# Smart contract tests
npx hardhat test

# Integration tests
npm test

# E2E tests (requires testnet accounts)
npm run test:e2e
```

### Building for Production

```bash
npm run build
npm start
```

### Deployment (AWS EC2)

MediVerify is deployed on an **AWS EC2** instance with an IAM instance role for persistent Bedrock access (no expiring SSO tokens).

1. **Launch EC2 instance** (Ubuntu, t3.medium or similar)

2. **Attach IAM instance role** with `AmazonBedrockFullAccess` policy
   ```bash
   # This gives the EC2 instance permanent Bedrock access — no AWS keys needed
   aws iam create-role --role-name MediVerifyEC2Role ...
   aws ec2 associate-iam-instance-profile ...
   ```

3. **Clone, install, and build on EC2**
   ```bash
   git clone https://github.com/jericho1050/agentverse.git
   cd agentverse
   npm install
   npm run build
   ```

4. **Set environment variables** in `.env.local` (Hedera keys, topic/token IDs)

5. **Run with PM2** for process management
   ```bash
   npm install -g pm2
   pm2 start npm --name mediverify -- start
   pm2 save
   ```

6. **Point domain** (e.g., `mediverify.my`) to EC2 public IP

**Key Architecture Decision**: The AI LLM call runs as a **child process** (`scripts/llm-call.mjs`) outside of webpack to avoid AWS SDK + Next.js RegExp OOM crashes. The EC2 IAM role eliminates credential rotation issues.

---

## Roadmap

### Hackathon MVP (March 2026)
- [x] AI document analysis with Claude Opus 4.6
- [x] HCS verification timestamps
- [x] MVT token minting on HTS
- [x] Smart contract escrow for payments
- [x] Shareable HashScan proof links
- [x] Health Passport feature
- [x] QR code sharing
- [x] PDF upload support
- [x] Data persistence (JSON file storage)
- [x] Live testnet deployment (https://mediverify.my)
- [x] HTTPS support (Let's Encrypt)
- [x] Demo video ([YouTube](https://www.youtube.com/watch?v=TPz5t4BIFE4)) + pitch deck (PDF)
- [x] AWS EC2 deployment with IAM instance role for Bedrock

### Post-Hackathon (Q2 2026)
- [ ] OCR for scanned documents (extract text from images)
- [ ] Multi-language support (Spanish, Chinese, etc.)
- [ ] HIPAA compliance audit
- [ ] Mobile app (React Native)
- [ ] Doctor dashboard for bulk verifications
- [ ] Mainnet launch

### Long-Term Vision
- [ ] Integration with EHR systems (Epic, Cerner)
- [ ] Insurance claim verification
- [ ] Telemedicine platform integration
- [ ] Global medical record portability
- [ ] Decentralized patient identity (DID)
- [ ] Cross-chain verification (Hedera + other networks)

---

## Security & Privacy

### Data Handling
- **Minimal Data Storage**: Only verification metadata persisted (document hash, score, timestamp) - not full document contents
- **Hash-Only on HCS**: Only SHA-256 hash + verification result published on-chain
- **Zero-Knowledge Sharing**: HashScan link proves verification without exposing document contents
- **Encrypted Transit**: Production deployment on AWS EC2

### Smart Contract Security
- **OpenZeppelin Contracts**: Industry-standard escrow implementation
- **Audited Code**: Contract tested with Hardhat test suite
- **Testnet First**: Extensive testing before mainnet deployment

### AI Safety
- **Claude Opus 4.6**: State-of-the-art medical language model
- **No Training on User Data**: AWS Bedrock does not use customer data for training
- **Human-in-the-Loop**: Doctors make final decisions, AI provides verification support

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

Built with passion for improving healthcare through blockchain innovation.

**Developer**: Jericho Wenzel
**GitHub**: [@jericho1050](https://github.com/jericho1050)

---

## Acknowledgments

- [Hedera Hashgraph](https://hedera.com) for the incredible DLT infrastructure
- [Anthropic](https://anthropic.com) for Claude AI and medical language understanding
- [AWS Bedrock](https://aws.amazon.com/bedrock/) for LLM hosting
- [HashScan](https://hashscan.io) for blockchain explorer and verification links
- Healthcare professionals who provided feedback on the verification flow
- Hackathon organizers and judges

---

**Built on Hedera. Powered by AI. Trusted by healthcare.**

[Explore the Live Demo](https://mediverify.my) • [Watch the Demo](https://www.youtube.com/watch?v=TPz5t4BIFE4) • [View on HashScan](https://hashscan.io/testnet/topic/0.0.8236051)
