# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project context

Tatiana (Senior Product Designer) is building the **ShieldPay UX Design Challenge** submission for Zama. ShieldPay is a fictional confidential DeFi product where users move funds from a **public balance** to an **encrypted private balance** using FHE (Fully Homomorphic Encryption). The prototype is frontend-only — all blockchain operations are simulated.

**Deadline: 2026-05-12**

## Reference documents

All processed design decisions live in `/docs`. Read the relevant file before making any change.

| File | When to read it |
|------|----------------|
| `docs/01-state-system.md` | Before touching any state logic or phase transitions |
| `docs/02-interaction-model.md` | Before deciding drawer vs modal vs full page |
| `docs/03-content-design.md` | Before writing or changing any copy |
| `docs/04-design-system-spec.md` | Before building or modifying any component |
| `docs/05-ux-rules.md` | Before any layout or component decision |
| `docs/09-execution-plan.md` | For Claude/Cursor prompts and build order |
| `docs/11-research.md` | For technical accuracy on fhEVM and wallet behavior |

## State system

The shield operation has exactly these states — use these names exactly, everywhere:

```
not_started → awaiting_wallet_confirmation → submitted → processing → finalizing → completed
                                                                                  → failed (types: failed_submission, failed_dropped, failed_finalization)
                                                                                  → cancelled
                                                                                  → timed_out
```

## How to handle UX/UI change requests

All changes happen at the component level. The `/design-system` route imports components directly, so it always reflects the real state of the app — they must never diverge.

**When a request fits the existing component API:** make the change in the component file only. Never add inline styles, className overrides, or one-off logic in page/screen files.

**When a request is too specific to fit cleanly into the existing component API** (e.g. a visual treatment that only makes sense in one context, or a layout variation that would break the current prop interface): **stop, do not write any code, and present Tatiana with options** — for example: add a new variant prop, create a new component, or restructure the existing one. Wait for her decision before proceeding.

## Component rules (non-negotiable)

1. **Every design change is made at the component level** — never hardcode copy or styles into screen files. If `TransactionStateCard` needs updated copy, change the component. All screens update automatically.

2. **`BalanceDisplay` always shows both balances** — public and private together, never one without the other.

3. **`StatusPersistenceBanner` lives in the layout shell**, not in routes. It renders on every page while an operation is active.

4. **`WalletConfirmationPrompt` is always full-page** — never a toast or inline notification.

5. **`RecoveryCard` always leads with fund safety** — "Your funds are safe" is the first line of every error state, when true.

6. **No numbered steps for system phases** — the PhaseIndicator is not a stepper. Users aren't doing steps; the system is.

## Copy rules

- Never write "Transaction pending" alone — always add timeline and permission to leave
- Never write "Confirmed" when the private balance isn't updated yet — use "Encrypting your balance"
- Never use jargon: gas→"network fee", FHE→omit, TFHE→omit, mempool→omit, nonce→omit
- Always include: what is happening, what the user should do (or "nothing — you can leave"), what happens if they leave
- Use "Shield" / "Unshield" as operation verbs. "Public balance" / "Private balance" as nouns. Never "encrypt", "lock", "hide".

## Critical technical detail (fhEVM-specific)

The shield operation has two async phases after the user signs:
1. **On-chain confirmation** — visible on Etherscan as "Success" (~12–36s)
2. **FHE finalization** — coprocessor computation + KMS re-encryption, happens AFTER confirmation (~1–3 min)

Etherscan shows "Success" while the private balance is still being computed. The `finalizing` phase UI must explicitly say: "Your transaction is confirmed on the network. We're now encrypting your private balance — this takes about 1 minute."

Never equate "transaction confirmed" with "operation complete."

## Simulation approach

Use `localStorage` + `setTimeout` to simulate the blockchain. Operation state must survive page refresh.

```typescript
// Phase simulation (useShieldOperation hook)
awaiting_wallet_confirmation → (2s) → submitted → (3s) → processing → (5s) → finalizing → (4s) → completed
// Add ~20% random failure injection at failed_dropped for demo purposes
```

Persist operation state to `localStorage` so the return-state flow (`StatusPersistenceBanner`) works after reload.

## Screens to build (7 total)

| Route | Screen | Key components |
|-------|--------|----------------|
| `/connect` | Wallet not connected | `ConnectWalletCard` |
| `/` | Dashboard | `BalanceDisplay` + `StatusPersistenceBanner` (if active) |
| `/shield` | Shield form | `ShieldForm` + `BalanceDisplay` |
| `/shield/confirm` | Awaiting wallet | `WalletConfirmationPrompt` |
| `/shield/processing` | Processing + Finalizing | `TransactionStateCard` + `StatusPersistenceBanner` |
| `/shield/success` | Complete | `TransactionStateCard(completed)` + `BalanceDisplay` |
| `/shield/failed` | Failed | `RecoveryCard` |

## Delivery artifacts

1. GitHub repo (React + TypeScript source)
2. Netlify link — live prototype + `/design-system` route showing all components
3. Optional: Loom walkthrough
4. Optional: Figma export via MCP

## Design Context

### Users
DeFi-literate users who understand wallets and balances but shouldn't need to understand FHE, gas mechanics, or coprocessors. They are moving real (simulated) funds and need to feel in control — especially during multi-phase operations where the system is doing work they can't see.

### Brand Personality
**Trustworthy, clear, modern.** The product handles money; every design decision should reinforce competence and transparency. Clarity is the primary constraint — when in doubt, say more, not less.

### Reference & Anti-Reference
- **Reference:** Coinbase — crypto-native but accessible, bridges technical and non-technical users, earns trust through visual restraint and precision.
- **Anti-reference:** 2017-era DeFi aesthetics — no neon greens, no aggressive gradients, no dark-and-glowing UI, no motion for motion's sake.

### Theme
Light mode only for this delivery. Dark mode tokens are defined in the token system and should not be removed, but are not a shipping requirement.

### Design Principles
1. **Clarity over cleverness** — every state communicates what's happening, what the user should do, and what happens if they leave. No ambiguity.
2. **System phases, not user steps** — the PhaseIndicator shows what the system is doing; users are passengers, not operators.
3. **Financial weight** — balances, amounts, and status changes are treated with visual gravity. No casual micro-copy around fund movements.
4. **Earned motion** — animations exist to communicate state transitions (Framer Motion, spring easing), not to decorate. Aggressive or looping motion is off-brand.
5. **Component discipline** — the design system is the source of truth. Every visual decision lives in a component; screens assemble, they don't style.
