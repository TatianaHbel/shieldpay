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

All three operation types share this phase vocabulary. Use these names exactly, everywhere:

```
idle → preparing → awaiting_wallet_step1 → awaiting_wallet_step2 → submitted → processing → finalizing → completed
                                                                                           → failed_submission
                                                                                           → failed_dropped
                                                                                           → failed_finalization
                                         → cancelled
                                         → timed_out

// Unshield only — additional phases after processing:
processing → proof_ready → awaiting_wallet_step2 → finalizing → completed
           → interrupted  (user left during proof wait; recoverable on return)
```

Operation types: `shield` | `send` | `unshield`

## Architecture

The shield/send/unshield flow is **drawer-based**, not route-based. All transaction states render inside `RightPanel` (the 380px drawer), which is always mounted in `AppShell`. Routes never change during an active operation.

- `useOperation` hook — manages phase state machine + `localStorage` persistence
- `RightPanel` — renders the correct sub-view for each phase
- `InfoBar` — persistent strip in the layout shell; shows operation status on every route while active
- `LeftColumnOverlay` — dims the left column at 30% (system running) or 50% (action required)

## Active routes

| Route | Page | Notes |
|-------|------|-------|
| `/connect` | `Connect` | Wallet connection + EIP-712 onboarding via `ConnectWalletCard` |
| `/` | `Overview` | Dashboard — `BalanceCard` (both) + `ActionButtonRow` + activity tabs |
| `/design-system` | `DesignSystem` | Full component library with live demos |
| `/use-case` | `UseCase` | Technical challenge write-up for Zama submission |

## How to handle UX/UI change requests

All changes happen at the component level. The `/design-system` route imports components directly, so it always reflects the real state of the app — they must never diverge.

**When a request fits the existing component API:** make the change in the component file only. Never add inline styles, className overrides, or one-off logic in page/screen files.

**When a request is too specific to fit cleanly into the existing component API** (e.g. a visual treatment that only makes sense in one context, or a layout variation that would break the current prop interface): **stop, do not write any code, and present Tatiana with options** — for example: add a new variant prop, create a new component, or restructure the existing one. Wait for her decision before proceeding.

## Component rules (non-negotiable)

1. **Every design change is made at the component level** — never hardcode copy or styles into screen files.

2. **`BalanceCard` always shows both cards together** — public and private side by side in Overview, never one without the other.

3. **`InfoBar` lives in the layout shell** (`AppShell`), not in routes. It renders on every page while an operation is active.

4. **Wallet confirmation views are always full-focus** — the left column overlays at 50% opacity; the drawer is the only interactive surface.

5. **Error views always lead with fund safety** — "Your funds are safe" is the first line of every error state where funds are genuinely untouched.

6. **No numbered steps for system phases** — `PhaseIndicatorVertical` is not a stepper. Users aren't doing steps; the system is.

## Component map

| Concept | Actual component / location |
|---------|---------------------------|
| Balance display | `BalanceCard` (`components/BalanceCard.tsx`) |
| Persistent operation banner | `InfoBar` (`components/InfoBar.tsx`) |
| Shield / Send / Unshield form | `ShieldForm` / `SendForm` / `UnshieldForm` — sub-functions inside `RightPanel.tsx` |
| Wallet confirmation view | `WalletConfirmView` — sub-function inside `RightPanel.tsx` |
| Processing / Finalizing / Completed view | `ProgressView` / `FinalizeView` / `CompletedView` — sub-functions inside `RightPanel.tsx` |
| Error / cancelled view | `FailedView` / `CancelledView` — sub-functions inside `RightPanel.tsx` |
| Phase progress timeline | `PhaseIndicatorVertical` (`components/PhaseIndicatorVertical.tsx`) |
| Left column dimming | `LeftColumnOverlay` (`components/LeftColumnOverlay.tsx`) |

## Copy rules

- Never write "Transaction pending" alone — always add timeline and permission to leave
- Never write "Confirmed" when the private balance is not updated yet — use "Encrypting your balance"
- Never use jargon: gas → "network fee", FHE → omit, TFHE → omit, mempool → omit, nonce → omit
- Always include: what is happening, what the user should do (or "nothing — you can leave"), what happens if they leave
- Use "Shield" / "Unshield" as operation verbs. "Public balance" / "Shielded balance" as nouns. Never "encrypt", "lock", "hide"

## Critical technical detail (fhEVM-specific)

The shield operation has two async phases after the user signs:
1. **On-chain confirmation** — visible on Etherscan as "Success" (~12–36s)
2. **FHE finalization** — coprocessor computation + KMS re-encryption, happens AFTER confirmation (~1–3 min)

Etherscan shows "Success" while the private balance is still being computed. The `finalizing` phase UI must explicitly say: "Your transaction is confirmed on the network. We're now encrypting your private balance — this takes about 1 minute."

Never equate "transaction confirmed" with "operation complete."

## Simulation

`useOperation` hook uses `localStorage` + `setTimeout` to simulate the blockchain. State survives page refresh.

```typescript
// Shield happy path timings
preparing (600ms) → awaiting_wallet_step1 → awaiting_wallet_step2
  → submitted (3s) → [20% chance: failed_dropped]
  → processing (5s) → finalizing (4s) → completed
```

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
