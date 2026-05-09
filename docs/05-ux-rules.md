# ShieldPay — UX Rules (Agent-Ready)

These rules are written to be consumed by AI agents, design systems, and cross-functional teams. Each rule includes context for edge case judgment.

---

## Rule 1: Multi-step blockchain operations are single persistent objects

**Rule:**
A blockchain operation that involves multiple transactions, wallet confirmations, or processing phases must be represented as **one persistent object** with visible phases — never as a sequence of independent steps or dialogs.

**Why it exists:**
Users cannot maintain mental context across fragmented interactions. When presented with "Confirm transaction 1 of 3," users lose track of the overall operation, cannot assess progress, and are more likely to abandon mid-flow. Worse, partial completion of a multi-step flow can leave funds in an intermediate state with no clear recovery.

**Correct usage:**
```
One PhaseIndicator with named phases inside the RightPanel:
Auth · Confirm · Encrypt · Done
```

**Incorrect usage:**
```
Modal: "Approve step 1"  →  dismissed
Modal: "Approve step 2"  →  dismissed
Modal: "Approve step 3"  →  dismissed
```

**Exceptions:**
- If a second user-required action is genuinely independent and optional (e.g., "Set spending allowance" before a transfer), it may be shown as a distinct pre-step — but only once, and only before the primary operation begins.

---

## Rule 2: Status must answer three questions, or it is incomplete

**Rule:**
Every operation status state must answer:
1. **What is happening?** (named phase, plain language)
2. **What should I do?** (explicit action required, or explicit permission to do nothing)
3. **What happens if I leave?** (operation continues / will fail / will be cancelled)

**Why it exists:**
Blockchain operations are asynchronous and often require users to wait without acting. Users misinterpret silence as failure. Explicitly answering "you can close this tab" reduces abandonment and support tickets. Without question 3, users either stay anxious or leave and assume the worst.

**Correct usage:**
```
"Your funds are being moved to your shielded balance.
This may take ~2 minutes. You can close this tab —
your balance will update automatically."
```

**Incorrect usage:**
```
"Transaction pending"
[spinner]
```

**Exceptions:**
- For very fast operations (< 5 seconds), question 3 may be omitted since leaving is not a meaningful risk in that timeframe.

---

## Rule 3: Failure copy must lead with fund status before explaining the error

**Rule:**
Any error state that could be interpreted as fund loss must lead with confirmation of fund safety **before** explaining what went wrong or offering a retry action.

**Why it exists:**
Users' primary fear during a failed financial transaction is that their money is gone. If the first thing they see is "Transaction failed" or a red error state, they will panic — even if their funds are completely safe. Addressing fund safety first prevents an emotional escalation that leads to support escalation and trust loss.

**Correct usage:**
```
Heading: "Something went wrong"
First line: "Your funds are safe — nothing was deducted from your balance."
Then: "The transaction didn't go through because [reason]. You can try again."
```

**Incorrect usage:**
```
Heading: "Transaction failed"
Copy: "Error code: 0x4a3b. Retry or contact support."
```

**Exceptions:**
- If funds ARE at risk (rare: partial execution, finalization errors after Unshield Step 1), do not lead with safety reassurance. Lead with: "Your funds are secured." then "Contact support to complete the release." Reserve "Your funds are safe" only for cases where funds are genuinely untouched.

---

## Rule 4: Wallet confirmations are right panel states, never popups or toasts

**Rule:**
When the application is waiting for a user to confirm a transaction in their external wallet (MetaMask, Rabby, etc.), replace the right panel content with a dedicated wallet confirmation state. Never use a toast, snackbar, modal, or inline notification.

**Why it exists:**
The wallet confirmation is the single moment in the flow that requires immediate user action in an external application. If this prompt competes with other UI, users miss it, the wallet popup times out, and the entire operation must be restarted. The visual weight of the right panel state — combined with the 50% overlay dimming the left column — matches the urgency and signals the required context switch.

**Correct usage:**
Right panel switches to `WalletConfirmStep` containing:
- Step indicator (e.g., "Step 1 of 2 — Authorization")
- What is being approved (specific amount and direction)
- Gas cost (or "free — no network fee" for EIP-712)
- Fallback instruction ("Not seeing a popup? Click your wallet icon.")
- A cancel option

**Incorrect usage:**
- Toast: "Wallet confirmation needed"
- Inline banner: "Check your wallet"
- Nothing (relying on the wallet popup to be self-explanatory)

**Exceptions:**
- If the user has previously confirmed an identical transaction in the same session and the wallet auto-approves, skip the dedicated confirmation state and show a brief processing indicator instead.

---

## Rule 5: Overview shows both balances; section pages show only their balance

**Rule:**
The Overview screen must always display both public balance and shielded balance simultaneously. Section pages (Public, Shielded) display only the balance relevant to that section.

**Why it exists:**
The Overview is where users form their understanding of the two-balance model. Showing both side by side makes the relationship between them legible — users can see that shielding moves ETH from one to the other. On section pages, showing only the relevant balance reduces cognitive load; the other balance is accessible via navigation.

**Correct usage:**
```
Overview:
┌──────────────┐  ┌──────────────┐
│ Public       │  │ Shielded  🔒 │
│ 0.74 ETH     │  │ 0.50 ETH     │
└──────────────┘  └──────────────┘

Public section:
┌──────────────────────────────────┐
│ Public balance                   │
│ 0.74 ETH                         │
└──────────────────────────────────┘
```

**Incorrect usage:**
- Showing only "Balance: 0.74 ETH" without labeling which balance
- Showing both balance cards on a section page (creates duplication, wastes space)

**Exceptions:**
- In a compact navigation element (header badge), showing only total or one balance for space reasons is acceptable if tapping/clicking expands to the dual Overview.

---

## Rule 6: "Confirming on-chain" ≠ "Funds available"

**Rule:**
The `finalizing` phase (FHE encryption after on-chain confirmation) must be explicitly communicated as distinct from transaction confirmation. Never show "Confirmed" or "Complete" until the shielded balance is actually updated.

**Why it exists:**
Users with crypto experience interpret "transaction confirmed" as "done." In FHE-based systems, on-chain confirmation triggers an additional encryption step that takes additional time. If the UI shows "confirmed" before the shielded balance is ready, users will try to use it, find it empty, and assume a loss.

**Correct usage:**
```
Phase: "Encrypting your balance"
Copy: "Your transaction is confirmed on the network.
We're now applying encryption to your shielded balance —
this takes about 1 minute. You can close this tab."
```

**Incorrect usage:**
```
Phase: "Confirmed ✓"
(shielded balance not yet updated)
```

**Exceptions:**
- None. This rule has no exceptions for FHE-based operations.

---

## Rule 7: Declare the type and cost of every wallet interaction before triggering it

**Rule:**
Before any wallet popup appears, the UI must display a pre-declaration in the right panel that tells the user: (a) what type of interaction it is, (b) whether it costs gas, and (c) what they are specifically approving. The popup must never arrive without prior context.

**Why it exists:**
There are three different wallet interactions in this system: on-chain transactions (cost gas, irreversible), EIP-712 session signatures (free, authorization only), and the implicit ZKPoK calculation (invisible, no popup). Users cannot distinguish these without help — MetaMask and Rabby display all wallet interactions with the same visual weight. A user who sees an unexpected signing request will reject it out of suspicion or confusion, breaking the flow.

**Correct usage — on-chain transaction:**
```
Right panel WalletConfirmStep:
"Confirm in your wallet — Step 2 of 2"
"Approving transfer of 0.5 ETH to your shielded balance."
"Network fee: ~0.003 ETH"
[then wallet popup appears]
```

**Correct usage — EIP-712 signature (one-time onboarding):**
```
ConnectWalletCard eip712-setup state:
"One more step to enable shielded transactions."
"Your wallet will ask you to sign. This is free — no network fee.
You only need to do this once."
[CTA: "Enable shielded access →"]
[then wallet popup appears]
```

**Incorrect usage:**
- Balance view automatically triggers wallet popup on page load
- Second wallet popup (finalizeUnwrap) appears without explaining why a second confirmation is needed
- Any wallet interaction where the popup is the first thing the user sees

**Exceptions:**
- If a previous identical interaction was approved in the same session and the wallet auto-approves silently, skip the pre-declaration.

---

## Rule 8: Multi-step wallet flows require step counters and auto-chaining

**Rule:**
When a single user-initiated operation requires multiple sequential wallet confirmations (e.g., `approve()` + `shield()`), the UI must: (a) show the total step count before the first prompt, (b) display progress between prompts, and (c) automatically trigger the next prompt without requiring a button click after the previous one confirms.

**Why it exists:**
Users who complete step 1 have already committed to the operation. Requiring them to find and click another button between steps introduces a decision point that reads as "something went wrong." Research (Beefy Finance pattern) shows that auto-chaining reduces abandonment at the approve→action gap by removing ambiguity.

**Correct usage:**
```
Before step 1: "2 wallet confirmations"
During step 1: "Step 1 of 2 — Authorization. Waiting for your wallet…"
After step 1 confirms: auto-triggers step 2 wallet popup within ~1s
During step 2: "Step 2 of 2 — Move funds. Waiting for your wallet…"
```

**Incorrect usage:**
```
[wallet popup 1 appears — user approves]
[screen returns to form]
[user must click "Shield" again to trigger step 2]
```

**Exceptions:**
- If the user has used `approvalStrategy: "max"` previously and the approval is already set, only one wallet prompt occurs. Don't show "Step 1 of 2" in that case — show "Confirm in your wallet" with no step counter.

---

## Rule 9: Gate the EIP-712 signature behind an explicit user action — once, during onboarding

**Rule:**
The EIP-712 signature request that enables shielded balance viewing must: (a) never fire automatically on any page load, and (b) only be requested once — during the wallet connection onboarding flow, not again on the dashboard.

**Why it exists:**
An unexpected wallet popup on page load violates user trust — the user did not ask for it, does not know what it is, and will reject it. This makes their shielded balance permanently unavailable until they understand what happened and retry. Additionally, once authorized, the session persists in IndexedDB (up to the configured TTL). Prompting again on the dashboard contradicts the "once per device" promise and creates unnecessary friction.

**Correct usage:**
```
After wallet connects (first time on device):
ConnectWalletCard shows eip712-setup state:
"One more step to enable shielded transactions."
[user clicks "Enable shielded access →"]
[EIP-712 popup appears]
[on completion: redirect to Overview with shielded balance visible]

On subsequent visits:
Session loaded from IndexedDB → balance displayed automatically, no popup
```

**Incorrect usage:**
- `useConfidentialBalance()` called on component mount without user consent
- Wallet popup triggered automatically when user navigates to the dashboard or shielded section
- Showing an "Authorize" button on the dashboard for users who have already authorized

**Exceptions:**
- If the session has expired (IndexedDB cache cleared or TTL elapsed), a fresh signature is required. Show a contextual inline prompt: "You're accessing from a new device. Verify your identity to view your shielded balance. Your funds are intact."
- If `useIsAllowed()` returns true, auto-load balance — no popup will be triggered by the SDK.
