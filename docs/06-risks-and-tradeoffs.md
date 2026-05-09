# ShieldPay — Risks and Trade-offs

## Risk matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| User confuses public vs shielded balance | High | High | Both BalanceCards on Overview; color-coded; persistent labels |
| User leaves during finalizing and thinks op failed | High | High | StatusPersistenceBanner + explicit "you can leave" copy |
| User panics on failed state (thinks funds lost) | Medium | High | FailedStep always leads with fund safety |
| Wallet popup goes unnoticed | High | Medium | Right panel WalletConfirmStep with 50% left overlay |
| User confused by "confirmed but not ready" (finalizing) | High | Medium | Explicit phase label + copy distinguishing tx confirm vs balance ready |
| User doesn't know the operation is still running (navigated away) | High | Medium | StatusPersistenceBanner on all routes |
| User thinks funds are lost in Unshield intermediate state | High | High | "Your funds are secured" copy + explicit balance note: "funds not released yet" |
| User abandons Unshield at proof_ready (funds stay stuck) | Medium | High | Urgent NavigationWarning + StatusPersistenceBanner + ActivityRow CTA |
| Fee anxiety (gas price uncertainty) | Medium | Medium | Show fee estimate upfront; high-gas warning if >2× typical |
| User double-submits (clicks "Shield" twice) | Medium | Medium | Disable submit button after first click; show inline preparing state |
| "Finalizing" phase feels like a hung state | Medium | Medium | Animated phase indicator; countdown estimate |
| User doesn't know what "shielded balance" means | Medium | Low | Helper text on BalanceCard: "Only you can see this balance" |
| Unshield interrupted recovery not triggered | Medium | High | localStorage persistence + resumeUnshield() on app load; banner is primary re-entry point |

---

## Key trade-offs

### 1. Transparency vs cognitive load

**Trade-off:** We could show all technical details (tx hashes, block numbers, FHE proof status). This builds trust with advanced users but overwhelms casual users.

**Decision:** Default to high-level status. Surface technical details as optional ("View on Etherscan →") for users who want them.

**Risk:** Advanced users may not trust a system that hides details.

**Mitigation:** Always provide the transaction hash link as a secondary option. Never hide information — just deprioritize it.

---

### 2. Accuracy vs reassurance in time estimates

**Trade-off:** Blockchain times are variable. Showing "~2 minutes" might be wrong.

**Decision:** Show estimates with `~` prefix and ranges ("1–3 minutes"). Update the estimate as the operation progresses.

**Risk:** If actual time exceeds estimate significantly, user anxiety increases.

**Mitigation:** If time exceeds estimate by 2×, update copy to "Taking longer than expected — still processing. Your funds are safe."

---

### 3. Persistent banner vs clean UI

**Trade-off:** A persistent status banner on every page creates visual clutter during long operations.

**Decision:** Accept the clutter. Operation visibility is more important than visual cleanliness during a financial operation.

**Risk:** Banner fatigue — users start ignoring it.

**Mitigation:** Use pulse animation only for `action-required` states. Static banner for "it's fine, just waiting" states.

---

### 4. Cancel option visibility

**Trade-off:** Making the cancel option too prominent increases accidental cancellations. Making it too subtle means users who want to cancel can't find it.

**Decision:** Cancel is visible but secondary — text link below primary content in WalletConfirmStep, never a button.

**Risk:** User who wants to cancel struggles to find the option.

**Mitigation:** "Cancel operation" text link is always present and clearly labeled during `awaiting_wallet` phases (the only phases where cancel actually works). After submission, replace with: "Why can't I cancel? — Once submitted, transactions cannot be cancelled."

---

### 5. Unshield interruption UX

**Trade-off:** Allowing users to leave during Unshield `processing` (proof wait) is necessary for usability, but creates a complex interrupted-recovery flow.

**Decision:** Allow leaving with soft navigation warning. Persist `unwrapTxHash` to localStorage. On return, automatically restore to correct phase (proof still generating → state 3; proof ready → state 4).

**Risk:** If localStorage is cleared, interrupted recovery is lost. User may believe funds are lost.

**Mitigation:** Three recovery entry points: (1) right panel auto-detects on load, (2) StatusPersistenceBanner, (3) ActivityRow with "Complete →" CTA. All three must trigger `resumeUnshield()`. Copy: "Your funds are secured. Contact support if you cannot recover."

---

### 6. Mobile wallet UX

**Trade-off:** On mobile, the wallet is a separate app. The confirmation flow is fundamentally different from desktop (where the wallet is a browser extension).

**Decision:** Design for desktop-first (browser extension wallet). WalletConfirmStep copy adapts based on wallet type detected.

**Risk:** Mobile users get incorrect instructions.

**Mitigation:** Detect wallet type and adapt copy. Default to "Check your wallet" if type is unknown. Mobile layout is deferred — see `02-interaction-model.md`.

---

## What could confuse users (top 5)

1. **"Why does my shielded balance show 0 even though the transaction confirmed?"** → The `finalizing` phase explanation must be iron-clad. Never say "Confirmed" until shielded balance is updated.

2. **"I closed the tab — did it still go through?"** → The return state + StatusPersistenceBanner handles this. Banner shows on re-open with current phase.

3. **"I see the fee but not the total I'll end up with"** → The operation forms show the net result in the "After" preview: "After: Public 0.24 ETH · Shielded 0.50 ETH"

4. **"I cancelled in MetaMask but the app still says 'Waiting for confirmation'"** → The app must handle wallet cancellation events. If event not caught, a 5-minute timeout resolves the state to `timed_out`.

5. **"My shielded balance decreased but nothing appeared in my public balance (Unshield)"** → The intermediate `processing` state copy must explicitly say: "Shielded balance: [X] ETH (−[Y]) · Public balance: [Z] ETH (funds not released yet)"
