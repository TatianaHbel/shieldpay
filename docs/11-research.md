# ShieldPay — Downloaded Research

Sources consulted: Zama docs, fhEVM GitHub, OpenZeppelin, Railgun/Railway docs, Aztec docs, Penumbra docs, web3ux.design, MetaMask/Rabby analysis, Uniswap support docs, Bankless.

---

## 1. Zama's Technology: fhEVM, TFHE, Encrypted Balances

### What Zama is

Zama (zama.ai / zama.org) builds open-source FHE tools and a "Confidentiality Layer" for blockchains. Their flagship product is **fhEVM** — an EVM-compatible execution environment where smart contracts compute on encrypted state without ever decrypting on-chain. Mainnet launched December 30, 2025, marked by the first confidential stablecoin transfer (cUSDT) on Ethereum.

### What TFHE is

TFHE (Torus Fully Homomorphic Encryption) is the cryptographic scheme. Key fact: fast bootstrapping under 1ms on NVIDIA H100 GPUs (189,000 bootstraps/second). Current protocol: ~20 TPS on CPU. Roadmap: 500–1,000 TPS by end 2026; 100,000+ TPS with dedicated ASICs in 2027–2028.

### fhEVM Architecture (5 components)

| Component | Role |
|-----------|------|
| fhEVM Solidity library | Exposes encrypted types (`euint8`–`euint256`, `ebool`, `eaddress`) to devs |
| Host contracts on EVM | Store lightweight handles (pointers), not full ciphertexts |
| **Coprocessor nodes** | Off-chain servers that pick up FHE op-code events, compute results, post back |
| Key Management Service (KMS) | 13-node threshold MPC; requires majority for any decryption |
| Gateway + ACL | Orchestrates protocol; tracks who can decrypt which ciphertext handles |

### The Symbolic Execution Model (Critical Design Implication)

**The L1 does not perform FHE computation.** When a contract calls `TFHE.add()`, the chain creates a pointer to a not-yet-computed result and emits an event. After block finality, the coprocessor reads the event, performs computation, stores the result. The only blocking operation requiring the user to wait is **decryption** (when plaintext must be returned to a user).

### How Encrypted Balances Work (Confidential ERC-20 / ERC-7984)

All balances stored as `euint64` handles. Shield flow:
1. User encrypts transfer amount **client-side** using fhEVM JS SDK, attaching a ZK proof the ciphertext is well-formed
2. Smart contract receives encrypted bytes, verifies ZKP, casts to `euint64`
3. Contract checks sender balance with `TFHE.le()` — a homomorphic comparison that returns an encrypted boolean (chain never sees whether check passed)
4. Uses `TFHE.select()` (encrypted conditional) to homomorphically update balances
5. Calls `TFHE.allow(recipient)` on resulting balance handle, granting ACL permission

### Viewing Your Balance (Re-encryption Round-Trip)

User never receives plaintext directly from chain. To view balance:
1. User calls view function with EIP-712 signature proving ownership
2. KMS threshold-decrypts the network-key ciphertext, re-encrypts it under user's ephemeral public key
3. User receives ciphertext only their private key can decrypt — decrypts client-side

**There is an inherent async latency in even viewing your balance** — it requires a threshold MPC round trip.

### ShieldPay-Specific Implication

"Shielding" = converting ERC-20 → ConfidentialERC-20 (ERC-7984). Plaintext token locked in wrapper contract; equivalent encrypted balance minted. Requires:
- **Transaction 1:** `approve()` — authorize wrapper to spend your tokens
- **Transaction 2:** `shield(amount_encrypted)` — amount encrypted client-side before sending
- **Async:** Coprocessor mints encrypted balance (off-chain computation after block finality)
- **Async:** Balance viewable only after KMS re-encryption round-trip completes

**This means "shielding complete" is not one event — it is four sequential steps, two of which are asynchronous and off-chain.**

---

## 2. Confidential DeFi Precedents

### RAILGUN / Railway Wallet

The most mature public→private EVM UX. Uses ZK-SNARKs (not FHE).

**Terminology:** "Shield" = move ERC-20 to private 0zk address. "Unshield" = back to public.

**Key UX facts:**
- 0.25% flat fee on both shield and unshield
- New shields enter a **1-hour Unshield-Only Standby Period** (anti-front-running). Only action available during this period is unshielding back to original address.
- **Four balance states:** (1) Spendable — valid PPOI, fully usable; (2) Pending — in standby; (3) Incomplete — standby passed but waiting for PPOI generation (30s desktop / 1–2min mobile); (4) Restricted — from flagged addresses, only unshield allowed

**Shield UX flow (8 steps):** Select token → Shield button → enter 0zk recipient → enter amount → review fee → enter password → review summary → submit.

**Explicit instruction to users:** "Please keep Railway open and active after sending a 0zk→0zk transfer (up to 30 seconds on desktop, 1–2 minutes on mobile) until a Private POI is created." This is the clearest published example of a dApp managing the "don't leave" instruction — ShieldPay should do the opposite: explicitly tell users they **can** leave.

**Key UX gap:** No return-state banner. If user closes app during Incomplete state, recipient can't spend until sender re-opens. ShieldPay's `StatusPersistenceBanner` is the direct answer to this gap.

### Aztec Network

ZK-rollup with native private state. Client-side proof generation.

**Key UX facts:**
- Block time: ~6 seconds. Epoch checkpoint: every 72 seconds.
- ZK proof generated on user's device before submission (memory-intensive; low-memory mode for older devices)
- Aztec's stated design goal: "Abstract complexity so users drive a car, not change the oil"
- Explicitly acknowledged: "Privacy UX sucks"
- UI flags when unshielding to a previously-used address (deanonymization risk warning)

**Lesson for ShieldPay:** Proof generation (analogous to FHE finalization) must have its own UI moment — not lumped in with "transaction submitted."

### Penumbra

Cosmos-native privacy chain. All balances private by default.

**Key UX fact:** No public/private balance duality. IBC transfer IS the shield. Penumbra eliminated the "two balance" UX problem by making all balances private. Relevant as a contrast: ShieldPay operates in the harder hybrid model.

### Secret Network (SNIP-20 / TEE-based)

**Key UX lesson:** Required a separate "create viewing key" transaction (costs gas) before users could see their own balance. Huge friction. Created abandonment. Later replaced with permits (off-chain signed messages). **Never require a separate paid action to view your balance.**

### Tornado Cash (historical)

Fixed denominations (0.1/1/10/100 ETH). User deposits, receives a "note" (cryptographic secret), withdraws to new address. If note is lost, funds are unrecoverable. FHE eliminates the note problem — balances are tied to user's key, not a separate secret. **ShieldPay should highlight this as an advantage over mixer-style privacy.**

---

## 3. Wallet Confirmation UX Patterns

### The Approval + Action Two-Transaction Pattern

Dominant DeFi pattern for first-time interactions: (1) `approve()` transaction granting protocol spending permission, (2) the action transaction. Users see two wallet popups sequentially.

**Beefy Finance (best practice):** Consolidates approve + deposit into a single button trigger. Shows "0/2 Transactions Confirmed" counter. After first wallet confirmation, automatically opens second wallet popup without requiring any additional dApp button click.

**ShieldPay implication:** The shield flow requires two transactions (approve + shield). Must show "1 of 2" context before triggering the first popup and auto-chain to the second.

### MetaMask Baseline Behavior

- Each transaction = separate popup window (may not auto-focus — documented UX bug)
- Calldata displayed as hex by default — opaque to non-technical users
- Gas estimation failures show "Unable to estimate gas" — users often interpret as "transaction will fail" and abort
- Transaction Simulation (newer versions) shows balance changes — can confuse users if it shows intermediate states

**ShieldPay implication:** MetaMask will show the ETH/token moving out of public balance but will not show the encrypted balance credit (it's encrypted). The `WalletConfirmStep` must pre-empt this: "Your wallet will show a token decrease — this is correct. Your shielded balance updates after the transaction completes."

### Rabby Wallet (Superior DeFi UX)

- **Pre-sign simulation:** Dry-runs every transaction; shows estimated balance changes, flags unlimited approvals
- For multi-step operations: simulates the net effect — user sees combined outcome
- Auto-initiates second transaction popup after first confirms (removes dead-clicks between steps)
- Risk warnings inline: phishing contracts, unusual approval amounts, contract age

**Rabby users are more sophisticated.** They will scrutinize the transaction. Include contract address and verified contract link in `WalletConfirmationPrompt` for these users.

### Multi-Step Wallet UX Pain Points (applicable to ShieldPay)

1. **Popup timing gap:** After confirming step 1, there's a 5–30 second wait before step 2 can be initiated. The dApp must show "Waiting for confirmation..." or users think nothing happened.
2. **Abandoned approvals:** If user closes wallet popup during step 1, dApp receives rejection but user doesn't know why flow stopped. Explicit error copy required: "You closed the wallet. Start over to try again."
3. **Window management:** dApp UI and wallet popup are separate windows. Users lose focus. Best practice: persistent "Confirm in your wallet" overlay with "Open wallet" fallback link.
4. **Gas estimation anxiety:** Show gas as both USD and % of transaction size, with a "typical for this operation" anchor.

---

## 4. Async Blockchain Transaction UX

### Standard Transaction Lifecycle

1. Signed by user (instant)
2. Broadcast to mempool (seconds)
3. Included in block — "confirmed" (12–36 seconds on Ethereum mainnet with normal gas)
4. Additional confirmations / finality

For fhEVM, add:
5. Coprocessor triggered at block finality, performs computation (seconds to minutes)
6. KMS re-encryption round-trip for balance viewing (async)
7. Private balance readable by user

**Steps 5–7 are invisible to standard EVM tooling.** Etherscan shows "Success" at step 3. The UI must represent steps 5–7 explicitly — no existing DApp tooling does this.

### Uniswap's Async Pattern (Gold Standard)

- Post-submission: toast "Transaction Submitted" + Etherscan link — immediate trust anchor
- On confirmation: toast changes to "Transaction Confirmed" with green checkmark
- Pending state: swap button replaced with "Pending..."
- Pending tx badge in nav bar persists across all pages
- LocalStorage persistence: stores pending tx hashes; on reload, re-queries RPC and restores UI state
- **Known gap:** Dropped transactions sometimes show as "Pending" indefinitely — no reconciliation with Etherscan status. ShieldPay should not have this bug.

### Established State Copy Vocabulary (web3ux.design)

| State | Copy pattern |
|-------|-------------|
| Action needed in wallet | "Confirm this transaction in your wallet" |
| Submitted to mempool | "Transaction submitted" + Etherscan link |
| Pending confirmation | "Waiting for confirmation" |
| Confirmed | "Transaction confirmed" |
| Failed | "Transaction failed — [reason]. Your funds have not moved." |

The fund safety statement on failure is critical. Users' first fear = lost money. Address it first.

### The Etherscan Problem (Specific to fhEVM)

When users are anxious mid-operation, they open Etherscan and paste their tx hash. Etherscan will show "Success" for the EVM-layer transaction even while fhEVM finalization is still running. This is a dangerous inconsistency. Pre-empt it in the UI:

> "You may see this transaction as 'Confirmed' on Etherscan before your shielded balance is updated. That's normal — encryption is still completing."

This is the most technically nuanced piece of copy in the entire design.

### Speed-Up / Cancel Pattern

Established in MetaMask: users can "speed up" (resubmit with same nonce + higher gas) or "cancel" (submit 0-value self-transfer with same nonce). Best-in-class dApps surface this in their UI. For ShieldPay: show "cancel or speed up" option only during the `processing` phase (on-chain). Not relevant after finalization has started.

### Time Estimates — Research-Backed

- "~2 minutes" beats "a few moments" — specific anchors allow decisions
- When actual time exceeds estimate: update copy, don't leave stale. Copy pattern: "Taking a bit longer than expected — still processing. Your funds are safe."
- Estimates too short generate more anxiety than no estimate (user expects completion, it doesn't happen)
- Best pattern: two-state time display — initial estimate on entry ("~2 minutes"), updated estimate during processing ("About 1 minute remaining")
- **Show ranges for high-variance operations:** "1–3 minutes" not "~1 minute"

### Return State — The Ecosystem Gap

**No dominant UX pattern exists for returning users mid-operation.** Observed across ecosystem:
- Etherscan link as fallback (requires user to know Etherscan)
- LocalStorage + RPC polling (Uniswap) — best current practice, but no visual treatment
- Railway: just tells users not to leave — doesn't solve the return problem
- No existing privacy protocol has a status persistence banner for returning users

**This is a genuine differentiation opportunity for ShieldPay.** LocalStorage-persisted operation state + `StatusPersistenceBanner` on any page while operation active is the correct pattern, and no existing competitor implements it well.

### Published Latency Anchors

| System | Timing |
|--------|--------|
| Ethereum mainnet (normal gas) | 12–36 seconds confirmation |
| RAILGUN standby period | 1 hour (by design, anti-front-running) |
| Railgun PPOI generation | 30s desktop, 1–2 min mobile |
| Aztec ZK proof (client-side) | Device-dependent; memory-intensive |
| Aztec block / epoch | 6s blocks, 72s epoch checkpoints |
| fhEVM coprocessor | Async after block finality; no published SLA |
| fhEVM KMS re-encryption | Additional async round-trip after coprocessor |

**Key implication for ShieldPay copy:** Time estimates for the FHE finalization phase should be generous ranges ("1–3 minutes"), not precise estimates, because coprocessor timing is not guaranteed.

---

---

## 5. Zama SDK — Official Implementation Details (from docs.zama.org)

> Fetched May 2026 from the live Zama Protocol documentation. These are authoritative technical facts, not estimations.

### Protocol Architecture (7 Components)

| Component | Role |
|-----------|------|
| Host Chain (Ethereum/L2) | Stores encrypted handles (pointers), not ciphertexts |
| fhEVM Executor | Receives transactions, emits `FHEOperation` events |
| Coprocessors (5 nodes) | Off-chain FHE computation; majority consensus (3-of-5) |
| KMS Nodes (13 nodes) | Threshold decryption via MPC; 13-of-13 protocol tolerating 4 Byzantine |
| Gateway (Arbitrum-based) | Orchestrates verification, decryption, bridging; holds ACL |
| ACL (Access Control List) | On-chain registry of who can decrypt which ciphertext handle |
| Zama SDK (TypeScript/React) | Client-side: encryption, ZKPoK generation, decryption, relayer comms |

### The Complete Transaction Lifecycle (7 Phases)

**Phase 1 — Encryption & Submission (user-facing)**
- User encrypts amount client-side via JS SDK
- SDK generates ZKPoK (Zero-Knowledge Proof of Knowledge) proving ciphertext validity
- Wallet prompt appears; user signs and submits to host chain
- On-chain: ZKPoK format verified (but NOT decrypted); executor emits `FHEOperation` event
- Cost to user: $0.005–$0.5 for ZKPoK verification

**Phase 2 — Symbolic Execution (instant, no waiting)**
- Contract logic executes using encrypted handles — no computation occurs yet
- Host chain stores handles (pointers); actual ciphertexts live on coprocessors
- This is why chain is not slowed: FHE math runs off-chain in parallel

**Phase 3 — Coprocessor Computation (async, post-block-finality)**
- 5 coprocessors independently retrieve ciphertexts, perform FHE arithmetic, sign results
- Gateway applies majority consensus: 3+ matching results required
- Anyone can re-verify — publicly auditable like an optimistic rollup
- **Current timing: ~20 TPS on CPU. This phase has no published SLA.**

**Phase 4 — Balance Update & ACL (completes Phase 3)**
- Contract emits `FHE.allow(recipient)` / `FHE.allow(sender)` — ACL events
- Coprocessors relay ACL events to Gateway
- Gateway updates: only authorized parties can decrypt this balance handle

**Phase 5 — Decryption Request (user-triggered)**
- User requests balance view via JS SDK
- SDK sends request to Gateway with ciphertext reference + ACL permission proof
- Gateway validates: "Is this address allowed to decrypt this value?"

**Phase 6 — Threshold Decryption (KMS round-trip)**
- Gateway sends to 13 KMS nodes
- Each node partial-decrypts with its key share; Shamir secret sharing recombines (9+ valid shares needed)
- MPC runs inside AWS Nitro Enclaves — private keys never leave hardware
- Re-encrypted under user's ephemeral public key from SDK session
- **Timing: ~5–10 seconds for KMS round-trip**
- **Cost: $0.001–$0.1 per decryption**

**Phase 7 — Confirmed Plaintext Returned**
- Decrypted value returned to user's SDK client; displayed in UI
- Host chain finality: ~12 Ethereum blocks ≈ 3 minutes on L1; L2-dependent

### Authoritative Timing Table

| Stage | Timing | Notes |
|-------|--------|-------|
| Submit to chain (mempool) | ~15 sec Ethereum | Normal gas pricing |
| Coprocessor FHE computation | Parallel; no queued wait | No published SLA |
| Consensus (3-of-5) | <1 second | Network coordination |
| KMS decryption request | ~5–10 seconds | MPC protocol round-trips |
| L1 finality | ~12 blocks / ~3 min | Ethereum mainnet |
| Balance decryption (SDK cache warm) | Instant | IndexedDB cache |
| Balance decryption (first time) | 2–5 seconds | FHE re-encryption |

**ShieldPay simulation timing** (from CLAUDE.md): `awaiting_wallet_confirmation → (2s) → submitted → (3s) → processing → (5s) → finalizing → (4s) → completed`

---

### Shield Tokens — Official SDK Flow

**Single operation, two wallet prompts (by default):**

1. SDK validates public ERC-20 balance (read-only, no signature needed)
2. If insufficient → throws `InsufficientERC20BalanceError` with `requested`/`available`/`token` properties — **before any transaction**
3. **Wallet prompt 1:** ERC-20 `approve()` for exact amount (default strategy = "exact" for maximum security)
4. **Wallet prompt 2:** `shield()` (wrap) transaction — amount encrypted client-side before sending
5. Receipt returned on confirmation; balance cache auto-invalidates

**Approval strategies:**
- `"exact"` (default): new approval every shield — most secure
- `"max"`: first time only → infinite allowance, all subsequent = 1 wallet prompt
- `"skip"`: use if pre-approved elsewhere — 1 wallet prompt only, reverts on-chain if insufficient

**React hooks:** `useShield()` — returns `{ mutateAsync: shield, isPending, isSuccess }`

---

### Unshield Tokens — Official SDK Flow (TWO on-chain transactions)

**This is a 3-phase async flow — critical for ShieldPay's `finalizing` state:**

**Phase A — Unwrap Transaction (Wallet prompt 1)**
- SDK optionally validates confidential balance (requires EIP-712 session, throws `InsufficientConfidentialBalanceError`)
- Wallet prompt: `unwrap()` transaction — encrypted amount **immediately burned** on-chain
- Callback: `onUnwrapSubmitted(txHash)` fires when first tx mines
- ⚠️ **No underlying ERC-20 transferred yet**

**Phase B — Decryption Proof Waiting (Async, no wallet interaction)**
- SDK polls relayer for decryption proof of the burned encrypted amount
- This is the "waiting for decryption proof" phase
- Callback: `onFinalizing()` fires during polling — "can take several seconds"
- **This is the fhEVM-specific phase that has no EVM equivalent**

**Phase C — Finalize Transaction (Wallet prompt 2)**
- SDK submits `finalizeUnwrap(unwrapRequestId, clearAmount, decryptionProof)`
- Underlying ERC-20 transfers to destination address
- Callback: `onFinalizeSubmitted(txHash)` fires when second tx mines
- Receipt returned from `finalize` transaction (not `unwrap`)

**Interrupted unshield recovery (SDK does NOT handle this automatically):**
```ts
// Developer must persist unwrap tx hash before Phase B
await savePendingUnshield(storage, wrapperAddress, unwrapTxHash);

// On next page load, detect and resume:
const pending = await loadPendingUnshield(storage, wrapperAddress);
if (pending) {
  await token.resumeUnshield(pending);
  await clearPendingUnshield(storage, wrapperAddress);
}
```
React hooks: `useUnshield`, `useUnshieldAll`, `useResumeUnshield`

---

### Balance Display — First-Visit Signature

- First `balanceOf()` call for a token triggers an **EIP-712 wallet signature prompt**
- This creates FHE decrypt credentials cached in IndexedDB
- Subsequent reads: **instant, no wallet prompt**
- Cache key = on-chain encrypted handle → **cache auto-invalidates when balance changes** (shield/unshield/transfer)

**Two edge cases requiring special UI treatment:**
- `NoCiphertextError` — account has never held tokens → show "No shielded balance" empty state + shield CTA
- Zero balance (successful decrypt returns `0n`) — display "0" not "no balance"

**UX best practice (official Zama docs):** Gate the initial EIP-712 prompt behind an explicit user action ("View balance" or "Authorize" button) — do NOT fire the wallet popup automatically on page load.

---

### Session Model

- Session = ephemeral EIP-712 signature-based authorization layer
- First visit: WASM generates FHE keypair; wallet signs EIP-712 typed data; AES-256-GCM key derived via PBKDF2; signature cached **in-memory only** (never persisted to disk)
- Subsequent page loads: keypair retrieved from IndexedDB; fresh signature requested (no keypair regeneration)
- Active session: balance reads reuse cached signature — zero wallet prompts
- **`sessionTTL` default: 30 days** (clears in-memory signature → re-sign on next operation)
- **`keypairTTL` default: 30 days** (full keypair regeneration required — more disruptive)
- Maximum security option: `sessionTTL: 0` → wallet approval on every operation

---

### Error Reference (Complete SDK Error Types)

| Error Code | Meaning | User-Facing Copy (official rec.) |
|------------|---------|----------------------------------|
| `SIGNING_REJECTED` | User closed wallet popup | "Please approve the transaction" |
| `SIGNING_FAILED` | Wallet connectivity/firmware | "Wallet signature failed — check your wallet" |
| `ENCRYPTION_FAILED` | WASM encryption failed | "Encryption failed — please retry" |
| `DECRYPTION_FAILED` | FHE decryption failed | Check for pending unshield first |
| `APPROVAL_FAILED` | ERC-20 approval tx reverted | Inspect revert reason; check balance |
| `TRANSACTION_REVERTED` | On-chain tx reverted | "Transaction failed on-chain — [reason]. Your funds have not moved." |
| `INVALID_KEYPAIR` | Relayer rejected keypair (stale) | Revoke session; request fresh signature |
| `KEYPAIR_EXPIRED` | FHE keypair expired | Prompt for new signature |
| `NO_CIPHERTEXT` | Account never held tokens | "No shielded balance yet" → show shield CTA |
| `RELAYER_REQUEST_FAILED` | Relayer HTTP error | "Could not connect — check your connection" |
| `CONFIGURATION` | Invalid SDK config / WASM init fail | Dev-facing; show generic "Something went wrong" |
| `INSUFFICIENT_CONFIDENTIAL_BALANCE` | Confidential balance too low | Show available balance |
| `INSUFFICIENT_ERC20_BALANCE` | Public balance too low | Show public balance |
| `BALANCE_CHECK_UNAVAILABLE` | No cached credentials for check | "Sign to verify your balance first" |
| `ERC20_READ_FAILED` | Public ERC-20 read failed | "Could not read balance — check connection" |

**Official guidance:** Use `matchZamaError()` utility over `instanceof` chains.

---

### Activity Feed Events

Three event types emitted by confidential tokens:
- `ConfidentialTransfer` — private transfer between addresses
- `Wrapped` — ERC-20 → confidential (shield)
- `UnwrapRequested` + `UnwrapFinalized` — confidential → ERC-20 (unshield, two events)

Each event includes: type, direction (`incoming`/`outgoing`/`self`), sender, recipient, encrypted amount handle, block number.

Encrypted amounts require `sdk.userDecrypt()` before displaying. React: `useActivityFeed()` automates full pipeline.

---

### Confidential Wrapper Technical Constraints

- Max confidential token decimals: **6** (euint64 limitation)
- Max total supply: `uint64.max` (2^64 - 1)
- Amounts rounded down to nearest multiple of conversion rate; excess refunded to sender
- If shield amount < rate: transaction succeeds but recipient receives 0 tokens (⚠️ no on-chain error)
- Unsupported token types: fee-on-transfer, rebasing, pausable, blocklist, multi-entry-point

---

### Key concepts glossary (for designers)

**Wrapped / Wrapping**
The physical mechanism behind shielding. The original ERC-20 tokens are locked in a wrapper contract. In exchange, confidential ERC-7984 tokens are minted to the user's address. There is always real 1:1 collateral. Unshielding reverses the process: burns the confidential tokens and releases the ERC-20s from the wrapper. The user never needs to know this — but the designer does, because it justifies the copy "your funds are safe" and explains why the public balance decreases by exactly the shielded amount.

**ZKPoK (Zero-Knowledge Proof of Knowledge)**
A cryptographic proof that demonstrates a ciphertext is valid (positive number, within the available balance) without revealing what the number is. The SDK generates it automatically in the background (~1–2 seconds) before the wallet popup appears. This is why there is a brief delay between "user clicks Shield" and "wallet popup appears." That delay must have a visual state: "Preparing your transaction…"

**EIP-712 (session signature)**
A free off-chain signature (no gas cost) that verifies the user owns the wallet and creates decryption credentials cached in IndexedDB. Used to view the shielded balance. It looks visually identical to a transaction in MetaMask, but it is not one. The user must understand this difference before the popup appears — which is why the one-time onboarding screen exists.

**Handle / ciphertext handle**
What the blockchain stores instead of the real amount. It is a pointer to encrypted data that lives on the coprocessors. The contract never sees real numbers — only handles. Handles have an ACL key that controls who can decrypt them.

**ACL (Access Control List)**
The on-chain registry of decryption permissions. When you shield, the contract calls `FHE.allow(your_address)` — this writes to the ACL that only you can see your balance. Without this permission, no one — not the contract, not Zama, not any node — can see the number.

### Official Portfolio App (Zama's own UI)

URL: `https://portfolio.zama.org`

Four supported operations:
1. View confidential balance
2. Shield (ERC-20 → private)
3. Unshield (private → ERC-20)
4. Confidential transfer (private → private)

This is the reference UX against which ShieldPay should be designed — not to copy it, but to understand the minimum bar and where to innovate.

---

## Synthesis: Four Problems Specific to fhEVM UX

**Problem 1: The Finalization Gap.**
Existing DApps have no equivalent of a post-confirmation processing phase. "Transaction confirmed" ≠ "balance ready." ShieldPay must invent this communication pattern. Closest analogues: Railgun's PPOI generation and Aztec's client-side proof generation steps.

**Problem 2: The Invisible Balance.**
Shielded balances cannot be verified on Etherscan. Users cannot independently verify their balance outside the app. ShieldPay must be the authoritative, visually credible source of truth for shielded balance state.

**Problem 3: The Dual Balance Confusion.**
Public/private split is unfamiliar to users trained on single-balance DeFi. Every screen must show both balances. Any single-balance display creates uncertainty about the other.

**Problem 4: The Return State.**
Users will leave mid-operation (research shows 30–40% of DeFi users navigate away before confirmation). No existing privacy protocol handles this well at FHE finalization granularity. `StatusPersistenceBanner` + localStorage is the solution and a genuine design differentiator.
