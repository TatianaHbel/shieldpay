# ShieldPay — Processed Project Brief

## What this is

A fictional confidential DeFi product UX challenge from Zama. The product is called **ShieldPay**. The core flow: a user moves funds from a **public balance** (visible on-chain) to a **shielded balance** (encrypted on-chain using FHE), then uses that shielded balance in a subsequent action (send shielded or unshield).

**This is a portfolio piece and job application artifact.** Treat it as senior-level work.

---

## Deliverable checklist

| # | Artifact | Format |
|---|----------|--------|
| 1 | User goal and assumptions | Written section |
| 2 | Flow map | State diagram (state → transition → condition) |
| 3 | Interaction model | Architecture decisions with rationale |
| 4 | 3–5 key screens | Mid-fidelity (annotated wireframes sufficient) |
| 5 | Content design | Labels, helper text, status messages, error copy |
| 6 | Design system implications | Component names + rules |
| 7 | Risks and trade-offs | Identified + mitigation |
| 8 | Collaboration context | How it scales across teams / AI agents |
| 9 | UX rules (agent-ready) | 2–3 formal rules with correct/incorrect usage |

**Final format:**
- GitHub repo (React source code)
- Netlify link (live prototype + design system in HTML)
- Optional: Loom walkthrough
- Optional: Figma export via MCP

---

## Key constraints

- No Zama branding or real assets
- No real backend — all blockchain ops are **simulated**
- Visual polish is optional; clarity and system thinking are mandatory
- Deadline: 7 days from receipt (today: 2026-05-05 → due **2026-05-12**)

---

## What they are actually testing

> "Design how a human trusts a system they cannot see, do not control, and that does not respond instantly."

They want to see:
- **System thinking**, not screen thinking
- A defined **operational model**, not a linear flow
- Design for **interruption and return**, not just the happy path
- **Reusable rules**, not one-off wireframes
- Copy that conveys **control and timeline**, not just status

---

## The core design problem

A user has a public ETH/token balance. They want to shield it (move it to an encrypted shielded balance). This involves:

1. User initiates the shield operation
2. Wallet (MetaMask/Rabby/etc.) pops up with a transaction to sign — this is external UI
3. Transaction is submitted to the blockchain
4. The blockchain processes it (this takes time — could be seconds, could be minutes)
5. FHE encryption finalizes the shielded balance
6. User can now use their shielded balance (send shielded or unshield)

The user might leave at step 3, 4, or 5. They might come back hours later. The design must handle all of this.

---

## Tokens and naming

Since we can't use Zama branding, use fictional names:
- **Product**: ShieldPay
- **Token**: SHLD or use generic ETH/USDC equivalents
- **Public balance**: "Visible balance" or "Public balance"
- **Encrypted balance**: "Shielded balance" (canonical term)
- **Operations**: "Shield funds" (public→shielded) / "Send shielded" (shielded→shielded) / "Unshield funds" (shielded→public)
