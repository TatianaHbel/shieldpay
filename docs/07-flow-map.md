# ShieldPay — Flow Map

## Reading guide

Format: `State [actor] → transition condition → Next State`

- **[U]** = User action required
- **[S]** = System action (no user needed)
- **[E]** = External system (wallet extension)

All operation flows happen inside the **right panel**. The left column (balance + activity) remains visible with an overlay during active operations.

---

## Entry flow

```
┌─────────────────────────────────────────────────────────────┐
│  ENTRY: App loads                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
         Is wallet connected?
                     │
          ┌──────────┴──────────┐
         NO                    YES
          │                     │
          ▼                     ▼
   ┌─────────────┐      ┌───────────────────┐
   │ /connect    │      │ Overview          │
   │ wallet [U]  │      │ (Dashboard)       │
   └──────┬──────┘      └────────┬──────────┘
          │                      │
    [U] Select wallet    [S] Check localStorage
          │                      │
    [E] Wallet popup     Active operation found?
          │                      │
    [U] Connect          ┌───────┴───────┐
          │             YES             NO
          ▼              │               │
   [U] EIP-712           ▼               ▼
   setup (one time)  Right panel     Right panel
   or skip           shows active    shows idle tabs
          │          operation       (Shield default)
          ▼
   Overview (Dashboard)
```

---

## Shield flow (right panel — Shield tab)

```
RIGHT PANEL: Shield tab idle
  │
  [U] Enter amount → click "Shield funds"
  │
  [S] ZKPoK generation (~1–2s, inline state)
  │
  ▼
STATE: awaiting_wallet_confirmation (Step 1/2 — approve)
  │ Left overlay: 50%
  │
  ├── [U] Confirms in wallet ──────────────────────────────┐
  │                                                        │
  ├── [U] Cancels in wallet ──→ cancelled                  │
  │     "No funds moved. Try again?"                       │
  │                                                        │
  └── [S] Timeout (5 min) ──→ timed_out                   │
        "No funds moved. Try again?"                       │
                                                           ▼
                                             STATE: awaiting_wallet_confirmation
                                             (Step 2/2 — shield, auto-triggered)
                                               │ Left overlay: 50%
                                               │
                                               ├── [U] Confirms ──→ submitted
                                               ├── [U] Cancels ──→ cancelled
                                               └── [S] Timeout ──→ timed_out
                                                              │
                                                              ▼
STATE: submitted
  │ Left overlay: 30%
  │
  ├── [S] Network rejects ──→ failed_submission
  │
  ▼
STATE: processing (transaction in mempool / being mined)
  │ Left overlay: 30%
  │ "You can close this tab"
  │
  ├── [S] Dropped (low gas) ──→ failed_dropped
  │
  ├── [S] Stuck (>2× estimate) ──→ processing
  │     (update copy: "Taking longer than expected")
  │
  ▼
STATE: finalizing (FHE encryption by coprocessor)
  │ Left overlay: 30%
  │ "Transaction confirmed. Encrypting your balance — ~1 min."
  │ "You may see this as Confirmed on Etherscan — that's expected."
  │
  ├── [S] Encryption error ──→ failed_finalization
  │
  ▼
STATE: completed
  │ Left overlay: 0% — balance cards animate delta
  │ Public balance decreases, Shielded balance increases
  │
  ├── [U] Send shielded ──→ right panel shifts to Send tab
  └── [U] Shield more ──→ right panel returns to Shield idle
```

---

## Send shielded flow (right panel — Send tab)

```
RIGHT PANEL: Send tab idle
  │
  [U] Enter recipient address + amount → click "Send shielded"
  │
  [S] ZKPoK generation (~1–2s, inline state)
  │
  ▼
STATE: awaiting_wallet_confirmation (single step)
  │ Left overlay: 50%
  │
  ├── [U] Confirms in wallet ──→ submitted
  ├── [U] Cancels in wallet ──→ cancelled
  └── [S] Timeout (5 min) ──→ timed_out
             │
             ▼
STATE: submitted
  │ Left overlay: 30%
  │
  ├── [S] Network rejects ──→ failed_submission
  │
  ▼
STATE: processing + finalizing
  │ Left overlay: 30%
  │ "You can close this tab"
  │ No Etherscan link (amounts encrypted, shows nothing meaningful)
  │
  ├── [S] Error ──→ failed
  │
  ▼
STATE: completed
  │ Left overlay: 0% — shielded balance card animates delta
  │
  ├── [U] Send again ──→ right panel returns to Send idle
  └── [U] Done ──→ right panel returns to Send idle
```

---

## Unshield flow (right panel — Unshield tab)

This flow is unique: two wallet confirmations separated by an async waiting period. After Step 1, shielded tokens are immediately burned.

```
RIGHT PANEL: Unshield tab idle
  │
  [U] Enter amount → click "Unshield funds"
  │ Warning shown: "2 confirmations — with a wait"
  │
  [S] ZKPoK generation (~1–2s, inline state)
  │
  ▼
STATE: awaiting_wallet_confirmation (Step 1/2 — unwrap)
  │ Left overlay: 50%
  │ Warning in panel: "After confirming, your shielded balance
  │  will decrease. A second confirmation releases the funds."
  │
  ├── [U] Confirms in wallet ──────────────────────────────────────┐
  │                                                                 │
  ├── [U] Cancels ──→ cancelled                                    │
  │     "No funds were moved."                                      │
  │                                                                 │
  └── [S] Timeout ──→ timed_out                                    │
                                                                    ▼
                                               STATE: submitted_unwrap
                                                 │
                                                 ├── [S] Rejects ──→ failed_submission
                                                 │    "Nothing removed from shielded balance"
                                                 ▼
STATE: processing — waiting for decryption proof
  │ Left overlay: 30%
  │ SHIELDED TOKENS ALREADY BURNED at this point
  │ Panel: "Preparing release. Your funds are secured."
  │ Panel: "Shielded balance: X ETH (−Y) / Public balance: Z ETH (funds not released yet)"
  │ "You can close this tab — we'll notify you when Step 2 is ready."
  │
  │ [U] tries to navigate away ──→ SOFT NAVIGATION WARNING
  │   "Your unshield will be paused. Funds are secured. [Stay] [Leave anyway]"
  │
  ├── [S] Proof generation error ──→ failed_proof
  │     "An error occurred. Funds are secured. Contact support."
  │
  ▼
STATE: proof_ready — action required
  │ Left overlay: 50%
  │ StatusPersistenceBanner: "⚡ Action required: Your unshield is ready [Complete →]"
  │ Panel: "Your unshield is ready to complete. One more confirmation."
  │
  │ [U] tries to navigate away ──→ URGENT NAVIGATION WARNING
  │   "Step 2 is ready. Funds won't release until you return. [Complete now] [Leave anyway]"
  │
  [U] Click "Complete unshield →"
  │
  ▼
STATE: awaiting_wallet_confirmation (Step 2/2 — finalizeUnwrap, auto-triggered)
  │ Left overlay: 50%
  │
  ├── [U] Confirms ──→ submitted_finalize
  ├── [U] Cancels ──→ step2_cancelled
  │     "Step 2 cancelled. Funds are secured. Return to complete."
  └── [S] Timeout ──→ proof_ready (returns to action required state)
             │
             ▼
STATE: finalizing (finalizeUnwrap on-chain)
  │ Left overlay: 30%
  │ "Releasing to public balance — ~30 seconds"
  │ "You can close this tab"
  │
  ▼
STATE: completed
  │ Left overlay: 0% — both balance cards animate deltas simultaneously
  │ Public increases, Shielded decreases
  │
  └── [U] Done ──→ right panel returns to Unshield idle
```

---

## Unshield — interrupted recovery flow

When the user leaves during `processing` (proof wait) and returns later:

```
User opens app / tab
  │
  [S] Read localStorage → find unwrapTxHash
  │
  Found?
    YES
      │
      [S] Query proof status
      │
      ├── Proof still generating ──→ right panel: state 3 (Waiting for proof)
      │                               Banner: "⏳ Unshield in progress"
      │
      └── Proof ready ──────────→ right panel: state 4 (Action required)
                                    Banner: "⚡ Action required: Complete your unshield"
    NO
      └── Right panel: idle tabs
```

**Three entry points to interrupted recovery:**
1. Right panel auto-detects on load (primary)
2. StatusPersistenceBanner: `⚡ Action required: Your unshield is paused [Complete →]`
3. Shielded section activity row: `[⚡] Unshielding 0.30 ETH ● Action required [Complete →]`

---

## Return flow — all operations

```
User opens app / tab
  │
  [S] Check localStorage for active operation
  │
  Found? YES → Right panel shows current operation state
  │
  ├── processing/finalizing (Shield or Send)
  │   → Panel: phase indicator + ETA + "You can close this tab"
  │   → Banner: "⏳ [Operation] in progress — ~X min remaining"
  │
  ├── proof_ready (Unshield)
  │   → Panel: "Action required" state (amber)
  │   → Banner: "⚡ Action required: Your unshield is ready"
  │
  ├── completed (while away)
  │   → Panel: success state
  │   → Banner: "✓ [Operation] complete" (green, dismissable, auto-dismiss 10s)
  │   → Balance cards animate delta
  │
  └── failed (while away)
      → Panel: recovery state
      → Banner: "⚠ [Operation] failed — Your funds are safe" (red)
      → Banner not dismissable until user acknowledges
```

---

## Decision points summary

| Decision | Behavior |
|----------|---------|
| User doesn't act on wallet prompt | Timeout after 5 min → cancelled |
| Transaction very slow (>2× estimate) | Update copy: "Taking longer than expected — still processing. Your funds are safe." |
| Transaction dropped | Show failed_dropped + retry with same params |
| User navigates away (Shield/Send) | Operation persists — right panel shows current state on return |
| User navigates away (Unshield state 3) | Soft warning → if user leaves, interrupted recovery on return |
| User navigates away (Unshield state 4) | Urgent warning → if user leaves, action required banner on return |
| User returns after completion | Panel shows success state + banner (dismissable) |
| User returns with interrupted Unshield | Panel auto-resolves to state 3 or state 4 from localStorage |
