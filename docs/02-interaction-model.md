# ShieldPay — Interaction Model

ShieldPay handles real fund movements across multiple async phases, each involving external wallet confirmations, on-chain transactions, and post-confirmation encryption. The interaction model is designed around one constraint: users must always know where their funds are, what is happening to them, and what to do next — regardless of how long the operation takes or whether they close the tab.

---

## Where actions happen

All financial operations — Shield, Send, Unshield — live in a persistent right-panel drawer, always mounted at the right edge of the layout regardless of which section the user is navigating.

The layout has two layers that never trade roles: the left column is the information layer (balances, activity history) and the right panel is the action layer (initiate, confirm, monitor, recover). This separation is a deliberate design constraint, not just a layout choice.

**Why the drawer, not a page or a modal:**

A full-page navigation model breaks context at the worst moment — the user loses sight of their balances mid-operation, exactly when the balance display is most relevant as a reference point. A modal risks accidental dismissal; for a multi-step flow that can leave funds in an intermediate state if abandoned, that is not an acceptable risk. The drawer stays mounted across all routes, so an active operation is never hidden when the user navigates away — it is always visible in peripheral context.

When wallet confirmation is required, the left column dims to 50% opacity. The drawer becomes the sole interactive surface without any navigation change. The user doesn't "go somewhere" to confirm; they stay in context and the visual weight shifts to where the action is.

When the system is processing without requiring user action, the overlay drops to 30% — a passive signal that something is in progress, without demanding attention or blocking the user from reading their balance or activity.

---

## Where details appear

Details appear at the point of decision — not front-loaded before the user has committed to anything, and not disclosed only after the fact. Every active state in the right panel explicitly answers three questions: what is happening, what the user should do (or that they can do nothing), and what happens if they leave.

**Before wallet prompts:** The right panel declares the type of interaction (on-chain transaction or free signature), what specifically is being approved, the cost, and which step of how many. The wallet popup never arrives without prior context in the panel. There are three meaningfully different wallet interactions in this system — an on-chain `approve()`, an on-chain `shield()` or `transfer()`, and a free EIP-712 session signature — and they look identical to the wallet UI. Without prior context from the panel, users cannot distinguish a gas-costing irreversible transaction from a free authorization and will reject the unexpected one out of caution.

**During system phases:** Each phase shows its name in plain language, an estimated duration, and explicit guidance on whether the user can leave or must stay. The third question — "what happens if I leave?" — is always answered because the Unshield operation has a critical intermediate state: after Step 1 confirms, shielded tokens are burned before the public ERC-20 is released. A user who closes the tab in that state needs to know exactly what to expect on return.

**The `finalizing` phase:** This is the most technically subtle moment in the flow. When a Shield or Send operation completes on-chain, Etherscan shows "Success" — but the shielded balance is still being computed by the FHE coprocessor. Users with crypto experience interpret "confirmed" as "done." The UI explicitly names this gap: "Your transaction is confirmed on the network. We're now encrypting your shielded balance — this takes about 1 minute." The completion state is not shown until the balance is actually updated. Equating on-chain confirmation with operation completion would cause users to assume their shielded balance is immediately available, find it empty, and interpret that as a loss.

---

## How progress is shown

Progress is shown via a named phase indicator — a linear track of system-state labels, always visible inline, never numbered.

**Why named phases, not numbered steps:**

Numbered steps imply the user is performing actions in sequence. In a multi-phase async blockchain operation, the user is not executing steps — the system is. Labelling system phases as "Step 1, Step 2, Step 3" creates false agency and generates anxiety when nothing changes after a step marker appears to complete. It also obscures the nature of what is happening: "Step 2" says nothing, while "Confirming" tells the user the transaction is being recorded on-chain.

**Why labels are always visible:**

A spinner with no label communicates nothing. In the `finalizing` phase — 30 to 90 seconds of FHE coprocessor computation following on-chain confirmation — users without context will interpret silence as failure and attempt to restart an operation that is already in progress. Labels are visible at all times, not on hover, because stressed users and mobile users do not discover affordances.

**Phase labels by operation:**

Shield uses: Authorizing · Submitting · Confirming · Encrypting · Done

Send shielded uses: Submitting · Confirming · Encrypting · Done

Unshield uses: Submitting · Confirming · Proof Ready · Releasing · Done

The Unshield flow has a named wait state between Step 1 and Step 2, with explicit permission to leave and an explicit instruction to return for Step 2. The gap between these phases is 1–2 minutes; the user needs to know the system is holding their place and what they will need to do when they come back.

---

## How the user can recover

Recovery is a first-class flow for every failure type and every exit point. Every failure state leads with fund status before explaining the cause. Cancellation is never treated as an error.

**Why fund status comes first:**

The primary user fear during a failed financial operation is fund loss, not technical failure. If the first visible element on a failure screen is "Transaction failed," users panic — even when their funds are completely untouched. Every failure state opens with the answer to that fear before describing what went wrong or offering a retry.

**Why "safe" and "secured" are used differently:**

"Your funds are safe" means genuinely untouched — the operation failed before any funds moved (wallet cancellation, submission rejection, dropped transaction). "Your funds are secured" means funds are in an intermediate state specific to the Unshield flow: shielded tokens have been burned, and the public ERC-20 release has not completed. The user must return to finish the operation, or contact support if there is a system error. Conflating these two states with the same reassurance copy would be misleading — one requires no action, the other requires completion.

**Wallet cancellation is a decision, not a failure:**

When a user dismisses a wallet prompt, they made a deliberate choice. The panel shows a neutral cancellation state ("No funds were moved. Start again when you're ready.") with no red styling and an immediate path to restart. Treating this as an error introduces false urgency and damages trust.

**State persistence across page reloads:**

Operation state persists via localStorage. If the user closes the tab during any active phase and returns, the right panel restores to the exact current phase — the user never has to reconstruct what happened. If an operation completed or failed while the tab was closed, the right panel shows the result state immediately on load.

**The InfoBar — always-on recovery surface:**

A persistent InfoBar renders across all routes while any operation is active. It is color-coded to urgency — cyan for background processing, amber for action required, green for complete, red for failed — and links directly back to the right panel's current state. A user who navigated away is never more than one click from their operation status.

**Escalated recovery for Unshield:**

The Unshield flow is the only operation with an irreversible intermediate state, and its navigation warnings are calibrated to that consequence. Leaving during the decryption proof wait shows a soft informational warning — the user can leave, their funds are secured, and the system will hold the proof until they return. Leaving while Step 2 is ready (proof generated, final wallet confirmation pending) shows an urgent block: "Step 2 is ready. Funds won't be released until you return." The escalation is proportional — the first warning informs without blocking; the second blocks because the cost of leaving at that moment is significantly higher.
