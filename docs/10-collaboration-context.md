# ShieldPay — Collaboration Context

## How this scales across teams

ShieldPay has three core operations: Shield, Send shielded, and Unshield. The same design system patterns apply to all of them — and will apply to any future operation (private swaps, private staking, private approvals). The design system must scale without requiring a redesign.

### Team structure assumption

| Team | Scope | Consumes |
|------|-------|----------|
| Wallet team | Connect, disconnect, signature flows | `ConnectWalletCard`, `WalletConfirmStep`, EIP-712 onboarding |
| Transaction team | All on-chain operations | `RightPanel`, `useOperation` hook, `StatusPersistenceBanner` |
| Balance team | Balance display, activity history | `BalanceCard`, `ActivityRow`, `StatusBadge` |
| Settings team | Notifications, preferences | Operation persistence settings |
| Onboarding team | First-time user experience | `ConnectWalletCard` explain modes, EIP-712 setup state |

### The problem with per-team wireframing

If each team wireframes their own confirmation dialogs and status states, you get:
- Inconsistent language ("pending" vs "processing" vs "in progress")
- Inconsistent visual patterns (spinner vs step indicator vs progress bar)
- Inconsistent error handling (modal vs toast vs inline)
- No shared mental model for the user

**Solution:** The `RightPanel` component — and its internal phase sub-components — is the single source of truth for any async on-chain operation. Every team uses it. No team reinvents it.

---

## How AI agents use this design system

AI agents (Copilot, Cursor, Claude Code) generate UI from component libraries. For this to work, the design system must be **rule-based, not intuition-based**.

A human designer sees a processing state and knows to use a certain visual treatment. An AI agent needs explicit rules.

### Rule format for agent consumption

Each component must have a documented decision rule:
```
WHEN: user has initiated a blockchain operation that is in progress
USE: RightPanel → ProcessingStep (with PhaseIndicator)
WITH: phase = current operation phase, overlayIntensity = 30
NEVER USE: spinner alone, toast notification, inline status text
BECAUSE: the operation must be persistent, trackable, and show timeline
```

### Component selection logic (for AI agents)

```
Is there an async operation in progress?
  YES → RightPanel renders operation phase sub-component
  Is user action required immediately?
    YES → WalletConfirmStep (overlay 50%)
    Is proof ready (Unshield)?
      YES → ProofReadyStep (overlay 50%)
    NO → ProcessingStep (overlay 30%)

Is the operation complete or failed?
  COMPLETE → SuccessStep with BalanceCard delta animations
  FAILED → FailedStep (fund safety as first element)

Is an operation active while user navigates?
  YES → StatusPersistenceBanner in AppShell
        ActivityRow in-progress entry at top of feed

Is user trying to leave during Unshield proof wait?
  State 3 (processing) → soft NavigationWarning
  State 4 (proof_ready) → urgent NavigationWarning
```

---

## Why defining rules matters more than wireframing every state

Consider: a product with 3 operation types × 13 states = 39 possible right panel states.

**Wrong approach:** Wireframe all 39 states individually.

**Right approach:** Define:
1. The state machine (13 phases, independent of operation type)
2. The `RightPanel` component (maps to the state machine)
3. The rules for which sub-component renders per phase
4. The copy formula for each phase

Result: Any new operation type gets correct UI for free by following the rules. Engineers implement once. Agents generate correctly.

---

## Shared vocabulary across teams

These terms must be used consistently across all teams, docs, and code:

| Concept | Canonical term | Never use |
|---------|---------------|-----------|
| Moving public→shielded | "Shielding" | "Encrypting", "Locking", "Hiding" |
| Moving shielded→public | "Unshielding" | "Decrypting", "Unlocking" |
| Shielded→shielded transfer | "Send shielded" or "confidential transfer" | "Private send", "Hidden transfer" |
| Visible balance | "Public balance" | "Regular balance", "Wallet balance" |
| Encrypted balance | "Shielded balance" | "Private balance", "Hidden balance", "Secret balance" |
| Operation in blockchain queue | "Processing" | "Pending", "Waiting" |
| FHE encryption step | "Encrypting your balance" | "Finalizing", "Confirming" |
| User-dismissed wallet | "Cancelled" | "Failed", "Rejected" |
| Network-rejected tx | "Failed" | "Cancelled", "Error" |
| Gas fee | "Network fee" | "Gas", "Gas fee" |
| Funds in intermediate Unshield state | "Your funds are secured" | "Your funds are safe" |
| Funds genuinely untouched | "Your funds are safe" | "Your funds are secured" |

---

## What happens when a new operation type is added

When a new operation (e.g., private swap, private staking) is added to the product:

1. Reuse the same `RightPanel` — pass a new `operationType` prop
2. Reuse the same state machine — same 13 phase types
3. Add an operation form (e.g., `SwapForm`) for the `idle` phase
4. Update `PhaseIndicator` labels for the new operation type
5. Update copy per phase (different headings, same structure)
6. **No new architectural components needed**

This is the test of a well-designed system: adding a new operation should require **zero new components** and only a **form + copy update**.
