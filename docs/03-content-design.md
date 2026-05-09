# ShieldPay — Content Design

## Principles

1. **Convey control and timeline**, not just status
2. **Give explicit permission** to leave when no action is needed
3. **Always distinguish** public balance from shielded balance
4. **Never leave the user wondering** if funds are lost
5. **Be specific about time** — "~2 minutes" beats "a few moments"

---

## Wallet interaction types (critical for copy)

There are three distinct moments when the wallet intervenes. Copy must treat each differently because their nature is different:

| Moment | What it is | Costs gas | How to announce |
|--------|-----------|-----------|-----------------|
| **Preparing transaction** | SDK encrypts amount and generates ZKPoK in background | No | Panel inline state: "Preparing your transaction…" (spinner, no popup) |
| **On-chain transaction** | `approve()`, `shield()`, `unwrap()`, or `finalizeUnwrap()` | **Yes** | Panel pre-declaration before popup: "Your wallet will open a window. Here's what you're approving:" |
| **EIP-712 signature** | Verifies wallet ownership only. Authorizes balance viewing. | **No** | Panel inline prompt: "You won't move any funds. You're just verifying your identity." |

**Copy rule:** Before any wallet interaction, declare its type and cost. Never let the user reach the wallet popup without prior context in the right panel.

---

## Copy by screen and panel state

### Screen: Wallet not connected (`/connect`)

| Element | Copy |
|---------|------|
| Heading | "Connect your wallet to get started" |
| Supporting | "ShieldPay uses your existing wallet. No new account needed." |
| Primary CTA | "Connect wallet" |
| Below CTA | "Supports MetaMask, Rabby, WalletConnect" |

### Connect — shielded access setup (EIP-712, one time)

Appears immediately after wallet connects, before dashboard.

| Element | Copy |
|---------|------|
| Heading | "One more step to enable shielded transactions" |
| Supporting | "Your wallet will ask you to sign. This is free — no network fee. You only need to do this once." |
| Primary CTA | "Enable shielded access →" |
| Skip link | "Skip for now" |
| After signing | Redirect to Overview |
| New device / cleared cache | "You're accessing from a new device. Verify your identity to view your shielded balance. Your funds are intact." |

> **Why this screen exists:** The EIP-712 signature looks visually identical to a transaction in MetaMask. Without prior context, users reject it thinking they are paying for something or that the request is suspicious.

---

### Right panel — Shield tab

#### Idle form

| Element | Copy |
|---------|------|
| Tab label | "Shield" |
| From label | "From — Public balance · [X] ETH available" |
| To label | "To — Shielded balance · [Y] ETH current" |
| Helper text | "Shielded funds are encrypted on-chain. Only you can see them." |
| Fee line | "Network fee ~0.002 ETH (~$4.70)" |
| Time estimate | "~2–3 minutes to complete" |
| Confirmations | "2 wallet confirmations" |
| After preview | "After: Public [X] ETH · Shielded [Y] ETH" |
| Primary CTA | "Shield funds" |
| High gas warning | "Network fees are high right now (~$15). Your transaction will still go through." |

#### Preparing transaction (~1–2s, inline)

| Element | Copy |
|---------|------|
| Button state | "⏳ Preparing transaction…" |
| Supporting | "Encrypting your amount before sending." |

> **Why this state exists:** Without it, the UI appears frozen for 1–2 seconds before the wallet popup. Users assume something failed.

#### Wallet confirmation — Step 1/2 (approve)

| Element | Copy |
|---------|------|
| Heading | "Confirm in your wallet" |
| Step indicator | "Step 1 of 2 — Authorization" |
| Supporting | "Your wallet has a request waiting." |
| What to approve | "Authorizing ShieldPay to move [amount] ETH from your public balance." |
| Fee line | "Network fee: ~0.002 ETH (paid from your public balance)" |
| Helper | "Not seeing a popup? Click your wallet icon in the browser." |
| Pre-empt confusion | "Your wallet will show your token balance decreasing — this is correct. Your shielded balance updates after the operation completes." |
| Cancel link | "Cancel operation" |

#### Wallet confirmation — Step 2/2 (shield)

| Element | Copy |
|---------|------|
| Heading | "Confirm in your wallet" |
| Step indicator | "Step 2 of 2 — Move funds" |
| Supporting | "One more confirmation to move your funds." |
| What to approve | "Approving transfer of [amount] ETH to your shielded balance." |
| Fee line | "Network fee: ~0.003 ETH" |
| Helper | "Not seeing a popup? Click your wallet icon." |
| Cancel link | "Cancel operation" |

#### Processing — submitted + confirming

| Element | Copy |
|---------|------|
| Heading | "Moving your funds" |
| Supporting | "Your transaction is being confirmed on the network. Usually takes 1–2 minutes." |
| Permission to leave | "You can close this tab — your balance will update automatically." |
| Phase label | "Confirming on-chain" |
| TX hash | "View on Etherscan →" |

#### Finalizing — encrypting balance (most critical state)

| Element | Copy |
|---------|------|
| Heading | "Encrypting your balance" |
| Supporting | "Your transaction is confirmed. We're now encrypting your shielded balance — this takes about 1 minute." |
| Fund safety | "Your funds are safe. They will appear in your shielded balance once encryption completes." |
| Permission to leave | "You can close this tab. Your balance will be updated automatically." |
| Phase label | "Encrypting" |
| Etherscan warning | "You may see this transaction as 'Confirmed' on Etherscan before your balance updates — that's expected." |

> **Why this state is critical:** Users with crypto experience interpret "transaction confirmed" as "done." In FHE-based systems, on-chain confirmation triggers an additional encryption step. If the UI shows "confirmed" before the shielded balance is ready, users will try to use it, find it empty, and assume a loss.

#### Success

| Element | Copy |
|---------|------|
| Heading | "Funds shielded" |
| Supporting | "[Amount] ETH has been added to your shielded balance." |
| Balance update | "Shielded balance: [Y] ETH (+[amount])" |
| Previous balance | "Public balance: [X] ETH (−[amount])" |
| Secondary action | "Shield more" |
| Primary action | "Send shielded →" |

#### Cancelled (user dismissed wallet)

| Element | Copy |
|---------|------|
| Heading | "Operation cancelled" |
| Supporting | "No funds were moved. Your public balance is unchanged." |
| Primary CTA | "Try again" |
| Secondary | "Done" |

> **Tone:** No negative framing. Cancellation is a valid choice. Never say "failed" for user-initiated cancellations.

#### Failed (network/system error)

| Element | Copy |
|---------|------|
| Heading | "Something went wrong" |
| Fund safety (first line) | "Your funds are safe — nothing was deducted from your balance." |
| Primary CTA | "Try again" |
| Secondary | "Contact support" |

| Failure type | Specific supporting copy |
|-------------|--------------------------|
| `failed_dropped` | "The transaction didn't go through — the network was congested. Retry with the same amount." |
| `failed_submission` | "The network rejected this transaction. This is usually temporary. Please try again." |
| `failed_finalization` | "An error occurred while encrypting your balance. Your public balance has been refunded. Contact support if this persists." |

---

### Right panel — Send shielded tab

#### Idle form

| Element | Copy |
|---------|------|
| Tab label | "Send" |
| To label | "To" |
| Address placeholder | "0x recipient address…" |
| Amount label | "Amount — From shielded balance · [X] ETH" |
| Fee line | "Network fee ~0.003 ETH" |
| Time estimate | "~2–3 minutes to complete" |
| Confirmations | "1 wallet confirmation" |
| After preview | "After: Shielded balance [Y] ETH" |
| Primary CTA | "Send shielded" |
| Recipient note | "The recipient address must support shielded tokens." |

#### Wallet confirmation — single step

| Element | Copy |
|---------|------|
| Heading | "Confirm in your wallet" |
| What to approve | "Sending [amount] ETH shielded to [0xaddress]." |
| Fee line | "Network fee: ~0.003 ETH" |
| Privacy note | "The transaction amount is private. Only you and the recipient can see it." |
| Helper | "Not seeing a popup? Click your wallet icon." |
| Cancel link | "Cancel operation" |

#### Processing + finalizing

| Element | Copy |
|---------|------|
| Heading | "Encrypting transfer" |
| Supporting | "Your transaction is confirmed. The transfer is being encrypted for sender and recipient — ~1 min." |
| Fund safety | "Your funds are safe." |
| Permission to leave | "You can close this tab." |

> No Etherscan link — private transfer amounts are encrypted on-chain. Etherscan shows the transaction but not the amount.

#### Success

| Element | Copy |
|---------|------|
| Heading | "Transfer sent" |
| Supporting | "[Amount] ETH sent to [0xaddress]." |
| Balance update | "Shielded balance: [Y] ETH (−[amount])" |
| Privacy note | "Only you and the recipient can see this transaction." |
| Actions | "Send again" · "Done" |

#### Cancelled

| Element | Copy |
|---------|------|
| Heading | "Transfer cancelled" |
| Supporting | "No funds were moved. Your shielded balance is unchanged." |
| Actions | "Try again" · "Done" |

---

### Right panel — Unshield tab

#### Idle form

| Element | Copy |
|---------|------|
| Tab label | "Unshield" |
| From label | "From — Shielded balance · [X] ETH" |
| To label | "To — Public balance · [Y] ETH current" |
| Fee line | "Network fee ~0.005 ETH" |
| Time estimate | "~3–5 minutes to complete" |
| Confirmations | "2 — with a wait between them" |
| After preview | "After: Public [Y+amount] ETH · Shielded [X-amount] ETH" |
| Primary CTA | "Unshield funds" |

#### Wallet confirmation — Step 1/2 (unwrap)

| Element | Copy |
|---------|------|
| Heading | "Confirm in your wallet" |
| Step indicator | "Step 1 of 2 — Remove from shielded balance" |
| What to approve | "Removing [amount] ETH from your shielded balance." |
| Fee line | "Network fee: ~0.002 ETH" |
| Pre-confirmation warning | "After confirming, your shielded balance will decrease. A second confirmation releases the funds to your public balance." |
| Helper | "Not seeing a popup? Click your wallet icon." |
| Cancel link | "Cancel operation" |

#### Waiting for proof (system phase — no wallet)

| Element | Copy |
|---------|------|
| Heading | "Preparing release" |
| Supporting | "Step 1 is complete. We're now preparing your funds for release to your public balance. This takes about 1–2 minutes." |
| Fund safety | "Your funds are secured." |
| Permission to leave | "You can close this tab — we'll notify you when Step 2 is ready." |
| Balance note | "Shielded balance: [X-amount] ETH (−[amount]) · Public balance: [Y] ETH (funds not released yet)" |

> **"funds not released yet"** is critical — it prevents the user from thinking the operation failed when they see their public balance unchanged.

#### Navigation warning — soft (state 3)

| Element | Copy |
|---------|------|
| Heading | "Your unshield is still in progress" |
| Supporting | "If you leave now, your unshield will be paused. You'll need to return to complete Step 2 and release your funds." |
| Fund safety | "Your funds are secured while you're away." |
| Primary CTA | "Stay" |
| Secondary | "Leave anyway" |

#### Proof ready — action required

| Element | Copy |
|---------|------|
| Heading | "Your unshield is ready to complete" |
| Supporting | "One more confirmation will release [amount] ETH to your public balance." |
| Fund safety | "Your funds are secured. Complete this step to release them." |
| Primary CTA | "Complete unshield →" |

> **Never say "Your funds are safe" here.** Funds are in an intermediate state — shielded tokens burned, public ERC-20 not yet released. Use "Your funds are secured" to signal they are protected but not fully accessible.

#### Navigation warning — urgent (state 4)

| Element | Copy |
|---------|------|
| Heading | "Your unshield needs one more step" |
| Supporting | "Step 2 is ready. If you leave now, your funds stay secured but won't be released until you return." |
| Primary CTA | "Complete now" |
| Secondary | "Leave anyway" |

#### Wallet confirmation — Step 2/2 (finalizeUnwrap)

| Element | Copy |
|---------|------|
| Heading | "Confirm in your wallet" |
| Step indicator | "Step 2 of 2 — Release funds" |
| What to approve | "Releasing [amount] ETH to your public balance." |
| Fee line | "Network fee: ~0.003 ETH" |
| Helper | "Not seeing a popup? Click your wallet icon." |

#### Finalizing (releasing ERC-20)

| Element | Copy |
|---------|------|
| Heading | "Releasing to public balance" |
| Supporting | "Almost done. Your funds are being transferred to your public balance — ~30 seconds." |
| Permission to leave | "You can close this tab." |
| TX hash | "View on Etherscan →" |

#### Success

| Element | Copy |
|---------|------|
| Heading | "Funds unshielded" |
| Supporting | "[Amount] ETH added to your public balance." |
| Balance update | "Public balance: [Y+amount] ETH (+[amount]) · Shielded balance: [X-amount] ETH (−[amount])" |
| Actions | "Unshield more" · "Done" |

#### Failed — copy varies by phase

| When | Heading | Fund safety | Specific copy |
|------|---------|-------------|---------------|
| Before Step 1 confirms | "Something went wrong" | "Your funds are safe — nothing was removed from your shielded balance." | "The transaction didn't go through. Please try again." |
| After Step 1, during proof wait | "Something went wrong" | "Your funds are secured." | "An error occurred. Your funds are secured. Contact support to complete the release." |
| Step 2 cancelled by user | "Step 2 cancelled" | "Your funds are secured." | "Return to complete the unshield and release your funds to your public balance." |

#### Interrupted recovery (return after leaving state 3)

| Element | Copy |
|---------|------|
| Heading | "Unshield paused" |
| Supporting | "You have an unfinished unshield of [amount] ETH from your last session." |
| Fund safety | "Your funds are secured." |
| Loading state | "Checking proof status…" |

---

### StatusPersistenceBanner copy

| Scenario | Banner copy |
|----------|-------------|
| Shield — processing | "⏳ Shielding in progress — [amount] ETH moving to shielded balance (~[X] min remaining)" |
| Shield — finalizing | "⏳ Almost done — Encrypting your shielded balance (~30s)" |
| Shield — completed while away | "✓ Shielding complete — [amount] ETH added to your shielded balance" |
| Shield — failed while away | "⚠ Shielding failed — Your funds are safe. Tap to retry." |
| Send — processing | "⏳ Transfer in progress — Encrypting shielded transfer (~[X] min)" |
| Send — completed while away | "✓ Transfer sent — [amount] ETH sent successfully" |
| Unshield — waiting for proof | "⏳ Unshield in progress — Preparing release of [amount] ETH (~[X] min)" |
| Unshield — proof ready | "⚡ Action required: Your unshield is ready — one confirmation needed" |
| Unshield — paused (interrupted) | "⚡ Action required: Your unshield is paused — return to release your funds" |
| Unshield — completed while away | "✓ Unshield complete — [amount] ETH added to your public balance" |
| Unshield — failed while away | "⚠ Unshield failed — Your funds are secured. Tap for details." |

> **Critical:** The SDK does NOT automatically recover an interrupted Unshield. The app must save `unwrapTxHash` to localStorage and call `resumeUnshield()` on next page load. The banner is the primary visual entry point to that flow.

---

## Vocabulary decisions

| Use this | Not this | Why |
|----------|----------|-----|
| "Shield funds" | "Encrypt funds" | More intuitive action verb |
| "Shielded balance" | "Private balance" or "Encrypted balance" | Connects directly to the action verb "Shield" |
| "Public balance" | "Regular balance" or "Wallet balance" | Clarity between the two states |
| "Send shielded" | "Send privately" | Consistent with "Shielded" vocabulary |
| "Network fee" | "Gas fee" | More accessible; gas is jargon |
| "~2 minutes" | "A few moments" | Specific times reduce anxiety |
| "You can close this tab" | (nothing) | Explicit permission reduces abandonment anxiety |
| "No funds were moved" | "Transaction failed" | Accurate and reassuring for cancellation |
| "Confirming on-chain" | "Pending" | "Pending" alone gives no information |
| "Your funds are secured" | "Your funds are safe" | Use "secured" only when funds are in an intermediate state (Unshield after Step 1). Use "safe" when truly untouched. |

---

## Copy anti-patterns to avoid

- ❌ "Transaction pending" (says nothing actionable)
- ❌ "Please wait..." (vague, no timeline)
- ❌ "Error occurred" (what error? what should I do?)
- ❌ "Step 1 of 3" for system phases (implies user must do 3 things)
- ❌ Technical jargon: nonce, mempool, calldata, FHE, TFHE, ZKPoK
- ❌ "Your funds might be delayed" (creates fear without context)
- ❌ "Your funds are safe" when funds are in an intermediate Unshield state (use "secured")
- ❌ "Transaction confirmed" when shielded balance is not yet updated (use "Encrypting your balance")
