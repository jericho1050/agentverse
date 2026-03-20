# MediVerify - Pitch Deck Script & Demo Video Outline

## Hackathon: Hedera Hello Future Apex 2026 | Open Track (Theme 4)

---

## Slide 1: Title

**MediVerify**
AI-Powered Health Passport on Hedera

*Your medical records. Verified. Immutable. Shareable.*

---

## Slide 2: The Problem

**Medical records are broken.**

- 80% of medical errors involve miscommunication during patient handoffs
- Insurance fraud costs $100B+ per year - fake or altered records are easy to create
- When you switch doctors, your records are stuck in fax machines and email chains
- There's NO way to prove a lab result is authentic and unaltered

*"I just moved cities. My new doctor doesn't trust the records I brought. I have to redo $2,000 worth of tests."*

---

## Slide 3: The Solution

**MediVerify: Upload. Verify. Share. Trust.**

1. **Upload** a medical document (lab results, prescriptions, diagnoses)
2. **AI verifies** it for completeness, consistency, and red flags
3. **Hedera stamps** the verification permanently on blockchain
4. **Share** a verification link anyone can independently check

No trust required. The blockchain IS the proof.

---

## Slide 4: How It Works (6-Step Flow)

```
Patient uploads document
    |
    v
AI analyzes completeness, consistency, red flags
    |
    v
Verification result stamped on HCS (immutable)
    |
    v
MediVerify Token (MVT) minted on HTS
    |
    v
Patient gets shareable verification link
    |
    v
Doctor/insurer clicks link -> sees proof on HashScan
```

**Every step is transparent and verifiable.**

---

## Slide 5: Live Demo

*[Show the /verify page]*

1. Select "Sample Lab Results" (pre-filled CBC)
2. Click "Verify Document"
3. Watch the 6-step verification in real-time:
   - Document received + SHA-256 hash computed
   - AI analyzing... (Claude Sonnet 4.5)
   - Analysis complete: Score 97/100, all findings positive
   - **Stamped on Hedera** - click HashScan link to prove it
   - **Token minted** - MVT proof of verification
   - Verification complete with shareable link

*Then show the incomplete oxycodone prescription - Score 25/100 with red flags*

"The AI doesn't just approve everything. It catches dangerous and incomplete documents."

---

## Slide 6: Hedera Integration

| Hedera Service | How MediVerify Uses It |
|----------------|----------------------|
| **HCS** (Consensus) | Every verification is stamped as an immutable message. 23+ messages on testnet. |
| **HTS** (Token) | MVT tokens minted per verified document. Portable proof of verification. |
| **Smart Contract** | Escrow contract deployed for pay-per-verify model (future). |
| **Mirror Node** | Real-time activity feed. Verification history queries. Balance checks. |

**All 4 core Hedera services used meaningfully.**

Testnet proof:
- HCS Topic: [hashscan.io/testnet/topic/0.0.8236051](https://hashscan.io/testnet/topic/0.0.8236051)
- MVT Token: [hashscan.io/testnet/token/0.0.8236059](https://hashscan.io/testnet/token/0.0.8236059)

---

## Slide 7: Why Hedera

- **$0.0001 per verification** - making medical record verification economically viable at scale
- **3-5 second finality** - patient gets verified result in real-time, not days
- **Immutable by design** - once stamped, no one can alter the verification
- **Public verifiability** - anyone with the HashScan link can check, no account needed
- **Low carbon** - Hedera is one of the most energy-efficient networks (matters for healthcare ESG)

*On Ethereum, each verification would cost $5+. On Hedera, it costs $0.0001. That's the difference between viable and impossible.*

---

## Slide 8: What the AI Actually Does

The AI doesn't just say "looks good." It performs deep analysis:

**Completeness Check:**
- Are all required fields present? (patient info, doctor info, lab values, reference ranges)
- Is anything missing that should be there?

**Consistency Check:**
- Do the values make medical sense?
- Are reference ranges provided and correct?
- Do diagnoses match the clinical findings?

**Red Flag Detection:**
- Controlled substances without proper documentation (caught our oxycodone test!)
- Values outside critical ranges
- Missing signatures or credentials

**Patient-Friendly Summary:**
- Translates medical jargon into plain English
- "Your blood test looks great. All values are normal."

---

## Slide 9: Market Opportunity

- Healthcare document management: **$8.7B market** by 2028
- Medical records interoperability: mandated by 21st Century Cures Act
- Insurance fraud detection: **$100B+** annual cost in the US alone
- EU AI Act requires audit trails for AI-assisted medical decisions

**Who uses MediVerify:**
- Patients switching doctors
- Insurance companies verifying claims
- Employers verifying medical leave documents
- Clinics receiving records from other providers
- Travel health verification (vaccination records)

---

## Slide 10: On-Chain Traction

**Hedera Testnet Metrics:**
- 23+ HCS verification messages published
- 10+ MVT tokens minted
- 10 diverse document types verified (lab results, prescriptions, diagnoses, imaging, vaccinations)
- 1 suspicious document correctly flagged (incomplete oxycodone prescription - 25/100)

**All verifiable right now on HashScan:**
- Topic: hashscan.io/testnet/topic/0.0.8236051
- Token: hashscan.io/testnet/token/0.0.8236059

---

## Slide 11: Roadmap

**Hackathon MVP (Now):**
- Text-based document verification
- AI analysis with scoring and red flag detection
- HCS immutable stamping + MVT token minting
- Shareable verification links

**Next (Q2 2026):**
- PDF/image upload with OCR
- FHIR-compatible health record format
- Multi-language support
- Pay-per-verify via escrow smart contract

**Future (2027):**
- Hospital system integrations (Epic, Cerner)
- Insurance API connections
- Cross-border medical record verification
- Mainnet deployment

---

## Slide 12: Team & Call to Action

**Built by:** [Your name]

**Try it now:**
- Live: [your domain or IP]
- GitHub: github.com/jericho1050/agentverse
- Video: [YouTube link]

**Tech stack:** Next.js 15, Claude Sonnet 4.5, Hedera SDK, Hardhat

**The future of medical records is verifiable, portable, and trustless. MediVerify makes it real.**

---

---

# Demo Video Script (5 minutes)

## 0:00 - 0:30 | The Hook

*[Show a frustrated person at a doctor's office]*

"Imagine you just moved to a new city. You bring your medical records to a new doctor, and they say: 'We can't verify these. You'll need to redo your blood work.'

That costs you $500 and a week of waiting. Why? Because there's no way to PROVE your records are authentic.

MediVerify fixes this."

## 0:30 - 1:00 | What MediVerify Does

*[Show the dashboard]*

"MediVerify is an AI-powered health passport built on Hedera blockchain.

You upload a medical document. AI verifies it's complete and accurate. The verification is permanently stamped on Hedera's blockchain. You get a shareable link that ANYONE can independently check."

## 1:00 - 3:30 | Live Demo

*[Navigate to /verify]*

"Let me show you. Here's our verification page. I'll start with a sample blood test - a Complete Blood Count."

*[Click Sample Lab Results, then Verify Document]*

"Watch the right panel. Each step happens in real-time."

*[Narrate each step as it appears]*
- "Document received. The system computed a SHA-256 hash - this is the document's fingerprint."
- "AI is analyzing... This is Claude Sonnet 4.5 checking completeness and consistency."
- "Score: 97 out of 100. The AI found all values are within normal range. It even wrote a patient-friendly summary."
- "Now the critical part - stamped on Hedera Consensus Service. This is REAL. Let me click this HashScan link..."

*[Click HashScan link, show the actual on-chain data]*

"See? This is on Hedera's public blockchain. Immutable. Anyone in the world can verify this."

- "A MediVerify Token was minted - proof that this document was verified."
- "And here's the share link. I can send this to any doctor."

*[Now show the dangerous document]*

"But MediVerify doesn't just approve everything. Watch what happens with a suspicious prescription."

*[Load the incomplete oxycodone script]*

"Score: 25 out of 100. Red flags everywhere. Missing patient info, missing prescriber credentials, controlled substance with 5 refills and no diagnosis. The AI caught all of it."

## 3:30 - 4:15 | Hedera Integration

*[Show architecture or the Activity page]*

"Under the hood, MediVerify uses all four core Hedera services:
- Consensus Service for immutable verification records
- Token Service for verification proof tokens
- Smart Contracts for our escrow system
- Mirror Node for real-time activity feeds

There are 23 real verification messages on the Hedera testnet right now. Every single one verifiable on HashScan."

## 4:15 - 5:00 | Vision & Close

"Medical records shouldn't require trust. They should require proof.

MediVerify gives patients ownership of their verified health data. Doctors get records they can trust. Insurance companies get claims they can verify instantly. And it all costs less than a penny per verification on Hedera.

The future of healthcare is verifiable, portable, and trustless. MediVerify makes it real.

Try it now at [your URL]. The code is open source on GitHub.

Thank you."

---

## Recording Tips

1. **Use OBS Studio or Loom** - both are free
2. **Record at 1080p minimum** - judges watch on big screens
3. **Use a good microphone** - audio quality matters more than video
4. **Practice once before recording** - you'll sound more natural
5. **Show your face** in a corner (Loom does this automatically)
6. **Pre-load all tabs** - HashScan, the app, GitHub
7. **Keep the incomplete oxycodone demo** - it's the "wow moment" that shows the AI isn't just rubber-stamping
8. **Click the HashScan link during the demo** - proving it's real is the whole point
