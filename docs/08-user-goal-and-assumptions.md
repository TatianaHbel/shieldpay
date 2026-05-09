# ShieldPay — User Goal and Assumptions

## Who the user is

**Target persona:** A crypto-native user with basic-to-intermediate DeFi experience.

- Understands wallets and wallet confirmations
- Has used DeFi protocols (swaps, staking, lending) at least a few times
- Knows ETH and ERC-20 tokens; understands what a balance is
- Does NOT understand FHE, zero-knowledge proofs, or on-chain encryption
- Does NOT understand why there are two separate balances without explanation
- Is privacy-motivated: they want to shield funds specifically because they care about on-chain privacy
- Is risk-sensitive: more anxious than a typical DeFi power user because this involves moving funds into a new system they haven't used before

**What they are NOT:**
- A first-time crypto user (we don't need to explain what a wallet is)
- A cryptography expert (we must not expose FHE complexity)
- A passive user (they made a deliberate decision to use privacy features)

---

## What they are trying to do

**Primary goal:** Move a specific amount of tokens from their visible, on-chain public balance into an encrypted shielded balance — and then use that shielded balance for a subsequent operation (a confidential transfer, or returning to public via unshield).

**Secondary goal:** Understand what happened, confirm their funds moved correctly, and feel confident the system worked.

**Implicit goal:** Not lose their funds, not get stuck, and not have to contact support.

---

## What they already understand

| Concept | Assumed knowledge |
|---------|------------------|
| Wallets | Knows how to connect a wallet, sign transactions |
| Balances | Understands that a balance is an amount they own |
| Transaction fees | Knows network fees exist and vary |
| Transaction time | Knows blockchain confirmations take time |
| Transaction states | Basic: pending, confirmed, failed |

## What they do NOT understand (and we must not assume)

| Concept | Design implication |
|---------|-------------------|
| Why there are two balances | Explain briefly on first encounter |
| What "encryption" means operationally | Use "shielded" not "encrypted" |
| What FHE is | Never mention it |
| Why confirmation ≠ balance update | Must explicitly bridge in the `finalizing` phase |
| What "finalizing" means technically | Replace with user-facing language: "Encrypting your balance" |
| Whether funds are safe during processing | Explicitly confirm at each phase |
| What the intermediate Unshield state means | Explain that shielded balance decreases before public increases: "funds not released yet" |

---

## User mental model we're designing toward

We want users to internalize this model:

> "I initiated an operation. It's in progress. The system is handling it. I can check back later. My funds are safe."

Not:

> "I clicked something and now I don't know if it worked. I hope I didn't lose my money."

---

## Emotional arc of the flow

### Shield

| Phase | Emotional state | Design job |
|-------|----------------|------------|
| Initiating | Cautious, deliberate | Build confidence with clear info upfront |
| Awaiting wallet | Slightly anxious, looking for the popup | Anticipate confusion; provide exact instructions |
| Processing | Background anxiety (especially first time) | Reassure; give permission to leave |
| Finalizing | Confusion ("confirmed but balance not updated?") | Proactively explain the distinction |
| Completed | Relief + curiosity ("okay, what now?") | Clear success state + next action ("Send shielded") |
| Failed | Alarm → fear of fund loss | Immediately: "Your funds are safe." Then: explanation. |
| Return (mid-op) | Disoriented ("what did I leave running?") | Immediate orientation: what operation, what phase, how long |

### Send shielded (confidential transfer)

| Phase | Emotional state | Design job |
|-------|----------------|------------|
| Initiating | Deliberate — privacy-motivated | Confirm privacy: amount is encrypted, only sender and recipient can see it |
| Awaiting wallet | Anxious — same as Shield | Same treatment |
| Processing + finalizing | Background anxiety | Same as Shield; no Etherscan link (amounts encrypted) |
| Completed | Relief + trust | Show "Only you and the recipient can see this transaction" |

### Unshield

| Phase | Emotional state | Design job |
|-------|----------------|------------|
| Initiating | Deliberate — converting back to public | Show 2-step nature upfront; warn about the wait |
| Step 1 wallet | Anxious | Pre-warn: "After confirming, your shielded balance will decrease. A second confirmation releases the funds." |
| Proof wait | Anxious — balance decreased, nothing appeared | Most critical: "funds not released yet" note; permission to leave |
| Proof ready | Relieved — action required | Amber alert; "Complete unshield →" is the only CTA |
| Step 2 wallet | Focused | Almost done framing |
| Completed | Relief | Both balances animate simultaneously |
| Interrupted recovery | Disoriented | "You have an unfinished unshield. Your funds are secured." + status check |

---

## Accessibility and edge cases

- **Slow connections:** Operation must be resumable; no state lost if connection drops
- **Multiple wallets:** User may have multiple wallets connected; show which wallet was used
- **One active operation at a time:** ShieldPay only allows one operation at a time (simplest safe behavior; prevents conflicting state)
- **Screen readers:** All status updates must be announced; phase transitions must trigger ARIA live region updates
- **New device / cleared cache:** EIP-712 session expired → contextual inline prompt: "Verify your identity to view your shielded balance. Your funds are intact."
