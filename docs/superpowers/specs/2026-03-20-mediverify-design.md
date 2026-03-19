# MediVerify - AI-Powered Health Passport on Hedera

**Date:** 2026-03-20
**Track:** Open Track (Theme 4)
**Deadline:** March 23, 2026

## Concept

Patients upload medical documents. AI verifies completeness and accuracy. Results are stamped on Hedera (immutable). Patients share verified records via link.

## 6-Step Verification Flow

1. **Upload** - Patient pastes medical document text
2. **AI Analysis** - Claude checks completeness, consistency, red flags
3. **AI Summary** - Plain-English summary generated
4. **HCS Stamp** - Verification + document hash published to HCS topic
5. **Token Mint** - MVT (MediVerify Token) minted to patient on HTS
6. **Share** - Verification link generated (HashScan-verifiable)

## Pages

| Route | Purpose | Reuses |
|-------|---------|--------|
| `/` | Dashboard (stats, recent verifications) | AgentVerse dashboard layout |
| `/verify` | Main page: upload + real-time verification SSE | Marketplace page pattern |
| `/records` | List of verified documents | Agents page pattern |
| `/share/[id]` | Public verification proof page | New (simple) |
| `/activity` | Real-time HCS feed | Same as current |

## Hedera Integration

- **HCS**: Verification results published to topic (immutable audit trail)
- **HTS**: MVT tokens minted per verified document (portable proof)
- **Smart Contract**: Optional escrow for pay-per-verify
- **Mirror Node**: Activity feed, verification history queries

## What Changes vs AgentVerse

| Component | AgentVerse | MediVerify |
|-----------|-----------|------------|
| Agent type | 3 agents (code/data/content) | 1 agent (document verifier) |
| Orchestrator | 12-step negotiation | 6-step verification |
| Main page | Marketplace (select agent) | Verify (upload document) |
| Store | Agents + transactions | Documents + verifications |
| Prompts | Code review/analysis/writing | Medical document analysis |
| Token | AVT (reputation) | MVT (verification proof) |

## What Stays Same

- All Hedera utilities (HCS, HTS, Mirror, escrow, client)
- LLM client (Bedrock via child process)
- DashboardLayout shell
- SSE streaming hooks
- shadcn/ui components
- AWS deployment infrastructure
- Dockerfile

## Scope: ~8-10 hours of work
