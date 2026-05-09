# ShieldPay — State System

## The core principle

Every financial operation (Shield, Send shielded, Unshield) is a **single persistent object with phases**, not a sequence of independent steps. The user sees one operation, not multiple transactions.

---

## Operation phase enum

```typescript
type OperationPhase =
  | 'idle'
  | 'preparing'              // ZKPoK generation (~1–2s, inline)
  | 'awaiting_wallet_step1'  // Wallet confirmation #1
  | 'awaiting_wallet_step2'  // Wallet confirmation #2 (Shield + Unshield only)
  | 'submitted'              // Transaction broadcast to mempool
  | 'processing'             // On-chain confirmation in progress
  | 'finalizing'             // FHE encryption / coprocessor computation
  | 'proof_ready'            // Unshield only: decryption proof generated, Step 2 required
  | 'completed'
  | 'failed_submission'      // Network rejected transaction
  | 'failed_dropped'         // Transaction dropped from mempool (low gas)
  | 'failed_finalization'    // Error during FHE encryption phase
  | 'cancelled'              // User dismissed wallet prompt
  | 'timed_out'              // Wallet prompt ignored >5 min
  | 'interrupted'            // Unshield only: user left during proof wait

type OperationType = 'shield' | 'send' | 'unshield'
```

---

## Shield flow state machine

Two wallet confirmations required: `approve()` then `shield()`.

```
idle
  │ [U] clicks "Shield funds"
  ▼
preparing (~1–2s inline — ZKPoK generation)
  │ [S] encryption ready
  ▼
awaiting_wallet_step1 (approve — Left overlay: 50%)
  ├── [U] cancels → cancelled
  ├── [S] timeout (5 min) → timed_out
  ▼ [U] confirms
awaiting_wallet_step2 (shield — auto-triggered — Left overlay: 50%)
  ├── [U] cancels → cancelled
  ├── [S] timeout → timed_out
  ▼ [U] confirms
submitted (Left overlay: 30%)
  ├── [S] rejected → failed_submission
  ▼
processing (Left overlay: 30%)
  ├── [S] dropped → failed_dropped
  ▼
finalizing — FHE coprocessor encryption (Left overlay: 30%)
  ├── [S] error → failed_finalization
  ▼
completed (Left overlay: 0%)
```

---

## Send shielded flow state machine

Single wallet confirmation. Transfer amount is encrypted on-chain — only sender and recipient can see it.

```
idle
  │ [U] clicks "Send shielded"
  ▼
preparing (~1–2s inline — ZKPoK generation)
  │ [S] encryption ready
  ▼
awaiting_wallet_step1 (single confirmation — Left overlay: 50%)
  ├── [U] cancels → cancelled
  ├── [S] timeout (5 min) → timed_out
  ▼ [U] confirms
submitted (Left overlay: 30%)
  ├── [S] rejected → failed_submission
  ▼
processing + finalizing combined (Left overlay: 30%)
  ├── [S] error → failed
  ▼
completed (Left overlay: 0%)
```

---

## Unshield flow state machine

Three async phases separated by a system wait. After Step 1 confirms, shielded tokens are **immediately burned** — this is the critical intermediate state.

```
idle
  │ [U] clicks "Unshield funds"
  ▼
preparing (~1–2s inline — ZKPoK generation)
  │ [S] encryption ready
  ▼
awaiting_wallet_step1 (unwrap — Left overlay: 50%)
  ├── [U] cancels → cancelled ("No funds moved")
  ├── [S] timeout → timed_out
  ▼ [U] confirms — SHIELDED TOKENS BURNED FROM THIS POINT
submitted (Left overlay: 30%)
  ├── [S] rejected → failed_submission ("Nothing removed from shielded balance")
  ▼
processing — waiting for decryption proof (Left overlay: 30%)
  │ "You can close this tab — Step 2 will be ready when you return"
  ├── [U] tries to navigate → soft NavigationWarning
  ├── [S] proof error → failed_proof ("Funds secured. Contact support.")
  │
  │ [U] leaves app → state saved as interrupted (localStorage)
  │ [U] returns → check proof status:
  │       proof still generating → restore to processing
  │       proof ready → restore to proof_ready
  ▼
proof_ready — action required (Left overlay: 50%)
  │ StatusPersistenceBanner: "⚡ Action required: Complete your unshield"
  ├── [U] tries to navigate → urgent NavigationWarning
  │
  [U] clicks "Complete unshield →"
  ▼
awaiting_wallet_step2 (finalizeUnwrap — auto-triggered — Left overlay: 50%)
  ├── [U] cancels → step2_cancelled ("Return to complete. Funds secured.")
  ├── [S] timeout → proof_ready (returns to action required)
  ▼ [U] confirms
finalizing — ERC-20 transfer to public balance (Left overlay: 30%)
  │ "~30 seconds"
  ▼
completed (Left overlay: 0%)
  │ Both balance cards animate delta simultaneously
```

---

## Failure types and recovery paths

| Failure State | Cause | Fund Status | Copy |
|--------------|-------|-------------|------|
| `cancelled` | User dismissed wallet prompt | Safe — untouched | "No funds were moved" |
| `timed_out` | Wallet prompt ignored >5 min | Safe — untouched | "No funds were moved" |
| `failed_submission` | Network rejected transaction | Safe — untouched | "The network rejected this transaction" |
| `failed_dropped` | Transaction dropped (low gas) | Safe — untouched | "The transaction didn't go through" |
| `failed_finalization` | Error during FHE encryption | Safe — refunded to public balance | "Contact support if this persists" |
| `failed_proof` | Unshield proof error (post-burn) | Secured — intermediate state | "Contact support to complete the release" |
| `step2_cancelled` | User cancelled Step 2 wallet | Secured — must complete | "Return to complete the unshield" |

**Fund safety copy rule:**
- "Your funds are **safe**" — when funds are genuinely untouched (before Step 1 confirms, or on cancelled/submission failure)
- "Your funds are **secured**" — when funds are in intermediate Unshield state (after shielded tokens burned, before public ERC-20 released)

---

## Return state logic

```
App loads
  │
  [S] Check localStorage for active operation
  │
  Found? YES → Right panel shows current operation state (not idle tabs)
  │             StatusPersistenceBanner renders in left column
  │
  ├── awaiting_wallet_* → Wallet confirmation prompt
  ├── submitted / processing / finalizing → Phase indicator + ETA
  ├── proof_ready (Unshield) → Action required state (amber)
  ├── interrupted (Unshield) → Query proof status:
  │       proof still generating → restore to processing
  │       proof ready → restore to proof_ready
  ├── completed (while away) → Success state + dismissable banner
  └── failed_* (while away) → Recovery state + banner (not dismissable until acknowledged)
  │
  NO → Right panel shows idle tabs (Shield default)
       No banner
```

---

## What the user sees per phase

| Phase | Right panel | Left overlay | 3-question check |
|-------|-------------|--------------|------------------|
| `idle` | Form with tabs | 0% | N/A |
| `preparing` | Inline spinner on button | 0% | "Encrypting amount before sending" |
| `awaiting_wallet_step1` | WalletConfirmStep (Step 1/N) | 50% | What: approving · Do: check wallet · Leave: can cancel |
| `awaiting_wallet_step2` | WalletConfirmStep (Step 2/N) | 50% | What: moving funds · Do: check wallet · Leave: can cancel |
| `submitted` | PhaseIndicator | 30% | What: submitted · Do: nothing · Leave: ok |
| `processing` | PhaseIndicator + ETA | 30% | What: confirming on-chain · Do: nothing · Leave: ok, tab will update |
| `finalizing` | PhaseIndicator + encryption copy | 30% | What: encrypting balance · Do: nothing · Leave: ok |
| `proof_ready` | ProofReadyStep (amber) | 50% | What: Step 2 ready · Do: complete unshield · Leave: stay or funds won't release |
| `completed` | SuccessStep with balance deltas | 0% | Done |
| `cancelled` | CancelledStep (neutral) | 0% | No funds moved · Restart when ready |
| `failed_*` | FailedStep (fund safety first) | 0% | "Your funds are safe" · Try again or contact support |

---

## The "3 questions" rule

Every right panel state must answer:
1. **What is happening?** — Current phase, in plain language
2. **What should I do?** — Required action (or "nothing, you can leave")
3. **What happens if I leave?** — Explicit reassurance or warning

If a right panel state cannot answer all three, it is incomplete.

---

## The critical phases

### `finalizing` (Shield / Send)

`finalizing` is hardest to communicate because:
- The transaction is already confirmed on-chain — Etherscan shows "Success"
- The shielded balance is not ready yet
- Users trained on crypto interpret "confirmed" as "done"

**Copy:** "Your transaction is confirmed on-chain. We're now encrypting your shielded balance — this takes about 1 minute. You can close this tab."

**Never:** "Confirmed" or "Complete" until the shielded balance is actually updated.

### `processing` (Unshield — waiting for decryption proof)

In Unshield, `processing` means:
- Shielded tokens have been burned (irreversible)
- The system is generating a decryption proof to authorize ERC-20 release
- The user can leave, but must return for Step 2

**Copy:** "Your funds are secured. Preparing your funds for release to your public balance — ~1–2 minutes. You can close this tab."

**Never:** "Your funds are safe" — use "secured" because funds are in intermediate state (burned from shielded, not yet released to public).
