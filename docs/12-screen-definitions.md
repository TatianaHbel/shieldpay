# ShieldPay — Screen Definitions

All screen states defined and validated through design sessions. Use this file as the reference for Figma and frontend build.

---

## Vocabulary updates (supersede previous files)

| Old term | Correct term |
|----------|-------------|
| Private balance | Shielded balance |
| Private section | Shielded |
| Private tab | Shielded |
| Send privately | Send shielded |
| Private transfer | Shielded transfer |

---

## Base layout

### Desktop structure

```
┌────────────┬──────────────────────────────┬──────────────────────┐
│  SIDEBAR   │  LEFT COLUMN                 │  RIGHT PANEL         │
│  ~220px    │  flexible                    │  ~380px fixed        │
│            │                              │                      │
│  Overview  │  changes per sidebar item    │  always present      │
│  Public    │                              │  always interactive  │
│  Shielded  │                              │                      │
│  Explore   │                              │                      │
│  ────────  │                              │                      │
│  0x1a2b…  │                              │                      │
│  Mainnet   │                              │                      │
└────────────┴──────────────────────────────┴──────────────────────┘
```

### Layout rules

- Sidebar is collapsible (toggle to ~60px icon-only mode)
- Right panel is always visible — never hidden
- Right panel is 380px fixed width on desktop
- StatusPersistenceBanner sits at the top of the left column, not above the full layout
- Right panel shows active transaction state regardless of which section is active on the left
- During active transaction, left column receives overlay (intensity varies by urgency)

### Overlay intensity by panel state

| Panel state | Left overlay |
|-------------|-------------|
| Wallet confirmation required | 50% |
| Processing / waiting | 30% |
| Proof ready — action required | 50% |
| Success / failed / cancelled | 0% |
| Idle (no transaction) | 0% |

### Right panel — default tab per section

| Active section | Default tab |
|---------------|-------------|
| Overview | Shield |
| Public | Shield |
| Shielded | Send |
| Explore | Shield |

---

## Screen: Connect wallet — `/connect`

### State 1: Landing (not connected)

```
┌─────────────────────────────────────────────────────────────┐
│                    [ShieldPay logo]                         │
│                                                             │
│           Private transactions, simply done.                │
│                                                             │
│        ┌───────────────────────────────────────┐           │
│        │   Connect your wallet to get started  │           │
│        │   No new account needed.              │           │
│        │                                       │           │
│        │   [Connect wallet]                    │           │
│        │                                       │           │
│        │   Supports MetaMask · Rabby ·          │           │
│        │   WalletConnect                       │           │
│        └───────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### State 2: Wallet selector

Card expands inline — no modal.

```
│   Choose your wallet                  │
│                                       │
│   ┌───────────────────────────────┐   │
│   │  🦊  MetaMask                 │   │
│   └───────────────────────────────┘   │
│   ┌───────────────────────────────┐   │
│   │  🐰  Rabby                    │   │
│   └───────────────────────────────┘   │
│   ┌───────────────────────────────┐   │
│   │  🔗  WalletConnect            │   │
│   └───────────────────────────────┘   │
│   [← Back]                            │
```

### State 3: Connecting — wallet popup active

```
│   🦊  Connecting to MetaMask          │
│   Check your browser extension        │
│   for a connection request.           │
│                                       │
│   Not seeing a popup?                 │
│   [Open MetaMask manually]            │
│                                       │
│   [Cancel]                            │
```

### State 4: Shielded access setup (EIP-712 — one time)

Appears immediately after wallet connects, before dashboard. Presented as a unified onboarding step, not a second random popup.

```
│   ✓  Wallet connected                 │
│                                       │
│   One more step to enable             │
│   shielded transactions.              │
│                                       │
│   Your wallet will ask you to sign.   │
│   This is free — no network fee.      │
│   You only need to do this once.      │
│                                       │
│   [Enable shielded access →]          │
│                                       │
│   [Skip for now]                      │
```

"Skip for now" defers EIP-712 to first visit to the Shielded section.

### State 5: EIP-712 wallet popup active

```
│   Setting up shielded access...       │
│   ⏳ Check your wallet for a          │
│      signature request.               │
│                                       │
│   Not seeing a popup?                 │
│   [Open MetaMask manually]            │
│                                       │
│   [Cancel]                            │
```

After signing → brief loader → redirect to Overview.

### Error states

| Error | Copy | CTA |
|-------|------|-----|
| Wallet not installed | "MetaMask isn't installed. Install it to continue." | [Install MetaMask →] |
| User rejected connection | "Connection cancelled. No changes were made." | [Try again] |
| User rejected EIP-712 | "Setup cancelled. You can enable shielded access later from the Shielded section." | [Go to dashboard →] |
| Wrong network | "ShieldPay runs on Ethereum Mainnet. Switch your network to continue." | [Switch network] |

---

## Screen: Overview — `/`

Default landing after connecting. Always shows both balances. Right panel defaults to Shield tab.

### State 1: Clean (default)

```
┌──────────────┬──────────────────────────────────────┬─────────────────────┐
│   SIDEBAR    │   MAIN CONTENT                       │   RIGHT PANEL       │
│              │                                      │                     │
│ ● Overview   │   Portfolio                          │   [idle — Shield]   │
│   Public     │                                      │                     │
│   Shielded   │   ┌─────────────────┐  ┌──────────┐ │                     │
│   Explore    │   │ Public balance  │  │ Shielded │ │                     │
│              │   │  1.24 ETH       │  │ •••• 👁  │ │                     │
│              │   └─────────────────┘  └──────────┘ │                     │
│              │                                      │                     │
│              │   Recent activity                    │                     │
│              │   ─────────────────────────────      │                     │
│              │   [in-progress first, then by date]  │                     │
└──────────────┴──────────────────────────────────────┴─────────────────────┘
```

**Balance cards:**
- Public: always visible, shows amount + USD value
- Shielded: hidden by default (`••••`), eye icon to reveal
- Both cards equal visual weight

**Eye icon behavior:**
- Click → ~1s skeleton loader (IndexedDB cache) → amount revealed
- Reveal persists for session across navigation
- User can configure auto-hide in Settings

**Recent activity:**
- Combined feed — public and shielded transactions
- In-progress rows always first
- Shielded amounts show as `••••` if balance is hidden

### State 2: Shielded balance revealed

Delta on clean state:
- `••••` → actual amount (e.g., `0.50 ETH`)
- Eye icon changes to eye-off
- USD equivalent appears below shielded balance
- Shielded amounts in activity reveal

### State 3: Return — operation in progress

```
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⏳ Shielding in progress — ~1 min remaining  [View →] │  │
│  └──────────────────────────────────────────────────────┘  │
│  [rest of left column with 30% overlay]                     │
│  Right panel shows active transaction state                 │
```

Banner color: `--color-processing` (cyan). Not dismissable.

### State 4: Return — completed while away

```
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ✓ Shielding complete — 0.5 ETH added       [View][✕] │  │
│  └──────────────────────────────────────────────────────┘  │
```

Banner color: `--color-success` (green). Dismissable. Auto-dismisses after 10s.
Balance cards animate delta on appearance.

### State 5: Return — failed while away

```
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⚠ Shielding failed — Your funds are safe  [View & retry →]│
│  └──────────────────────────────────────────────────────┘  │
```

Banner color: `--color-error` (red). Not dismissable until user views details.

### State 6: Return — unshield action required

```
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⚡ Action required: Your unshield is ready            │  │
│  │   One more confirmation needed         [Complete →]  │  │
│  └──────────────────────────────────────────────────────┘  │
```

Banner color: `--color-warning` (amber). Never dismissable. Right panel shows "Proof ready" state.
**Never say "Your funds are safe" here** — they are in an intermediate state. Use: "Your funds are secured. Complete this step to release them."

---

## Screen: Public section — `/public`

### State 1: Clean

```
┌──────────────┬──────────────────────────────────────┬──────────────┐
│   SIDEBAR    │   MAIN CONTENT                       │ RIGHT PANEL  │
│              │                                      │              │
│   Overview   │   Public balance                     │ [idle—Shield]│
│ ● Public     │                                      │              │
│   Shielded   │   ┌──────────────────────────────┐  │              │
│   Explore    │   │  1.24 ETH                    │  │              │
│              │   │  $2,913.40                   │  │              │
│              │   │                              │  │              │
│              │   │  [Shield funds →] [Add funds] │  │              │
│              │   └──────────────────────────────┘  │              │
│              │                                      │              │
│              │   Activity                           │              │
│              │   ─────────────────────────────      │              │
│              │   [in-progress rows first]           │              │
│              │   [↑] Shielded  −0.50 ETH ● Complete│              │
│              │       May 8    [Etherscan ↗]        │              │
│              │   [↓] Received +1.24 ETH ● Complete │              │
│              │       May 7    [Etherscan ↗]        │              │
└──────────────┴──────────────────────────────────────┴──────────────┘
```

**Shielded balance is NOT shown in this section.** Section pages show only their own balance.

**Button hierarchy:**
- "Shield funds →": primary (indigo, filled) → activates Shield tab in right panel
- "Add funds": secondary (outlined) → opens modal

**Activity shows only public-related transactions:**

| Type | Label | Direction |
|------|-------|-----------|
| Shield initiated | "Shielded" | `−` |
| Unshield completed | "Unshielded" | `+` |
| Received | "Received" | `+` |

Every completed row has an Etherscan link. In-progress rows have a detail link `[→]`.

### State 2: Empty

```
│   0.00 ETH                                │
│                                           │
│   Your public balance is empty.           │
│   Unshield funds to move them here,       │
│   or receive ETH to get started.          │
│                                           │
│   [Unshield →]    [Copy address]          │
```

### Add funds modal

Opens centered over the section. Modal is appropriate here — purely informational, no transaction risk.

```
┌────────────────────────────────────┐
│  Add funds to Public balance   [✕] │
│                                    │
│  ┌──────────────────────────────┐  │
│  │         [QR CODE]            │  │
│  └──────────────────────────────┘  │
│                                    │
│  0x1a2b3c4d...8e9f   [Copy]  [↗]  │
│                                    │
│  Only send ETH or ERC-20 tokens    │
│  to this address. Sending other    │
│  assets may result in permanent    │
│  loss.                             │
│                                    │
│  Network: Ethereum Mainnet         │
└────────────────────────────────────┘
```

---

## Screen: Shielded section — `/shielded`

### State 1: Default (balance hidden)

```
┌──────────────┬──────────────────────────────────────┬──────────────┐
│   SIDEBAR    │   MAIN CONTENT                       │ RIGHT PANEL  │
│              │                                      │              │
│   Overview   │   Shielded balance                   │ [idle—Send]  │
│   Public     │                                      │              │
│ ● Shielded   │   ┌──────────────────────────────┐  │              │
│   Explore    │   │  ••••••                  👁   │  │              │
│              │   │                              │  │              │
│              │   │  [Send shielded →][Unshield →]│  │              │
│              │   └──────────────────────────────┘  │              │
│              │                                      │              │
│              │   Activity                           │              │
│              │   ─────────────────────────────      │              │
│              │   [⚡] Unshielding  ● In progress [→] │              │
│              │       Just now                       │              │
│              │   [→] Sent shielded +•••• ● Complete │              │
│              │       May 8                         │              │
│              │   [↓] Shielded in  +•••• ● Complete │              │
│              │       May 7                         │              │
└──────────────┴──────────────────────────────────────┴──────────────┘
```

No public balance shown here. Section shows only shielded balance.
Activity amounts show as `••••` while balance is hidden.

**Button hierarchy:**
- "Send shielded →": primary (deep purple, filled) → activates Send tab in right panel
- "Unshield →": secondary (outlined) → activates Unshield tab in right panel

**Activity shows only shielded-related transactions:**

| Type | Label | Direction |
|------|-------|-----------|
| Shield completed | "Shielded in" | `+` |
| Shielded transfer sent | "Sent shielded" | `−` |
| Shielded transfer received | "Received shielded" | `+` |
| Unshield initiated | "Unshielding" | `−` |

No Etherscan link on shielded transfers (amounts encrypted, Etherscan shows nothing meaningful).
Unshield rows have Etherscan link (on-chain event).

### State 2: Balance revealed

Delta on State 1:
- `••••••` → actual amount (e.g., `0.50 ETH`)
- USD equivalent appears
- Eye icon changes to eye-off
- Activity amounts reveal

### State 3: Empty

```
│   0.00 ETH                                │
│                                           │
│   Your shielded balance is empty.         │
│   Shield funds to start using private     │
│   transactions.                           │
│                                           │
│   [Shield funds →]                        │
```

Send shielded and Unshield absent — nothing to act on. Single CTA directs correctly.

### State 4: First visit / no session (new device or cleared cache)

Only appears if user skipped EIP-712 during onboarding or is on a new device.

```
│   ┌──────────────────────────────────────────┐  │
│   │                                           │  │
│   │            🔒                             │  │
│   │                                           │  │
│   │   To view your shielded balance,          │  │
│   │   verify you own this wallet.             │  │
│   │                                           │  │
│   │   Free — no network fee.                  │  │
│   │   One time per device.                    │  │
│   │                                           │  │
│   │   [Authorize to view →]                   │  │
│   └──────────────────────────────────────────┘  │
│                                                  │
│   Sign in to view your shielded activity         │
```

After signing → balance hidden state (State 1) with cached session.

---

## Right panel — Shield tab

### Idle form (default)

```
┌──────────────────────────────────────┐
│   Shield      Send     Unshield      │
│   ───────                            │
│                                      │
│   From                               │
│   Public balance · 1.24 ETH          │
│   ┌──────────────────────────────┐   │
│   │  0.00                   ETH  │   │
│   └──────────────────────────────┘   │
│   [25%]  [50%]  [75%]  [Max]        │
│                                      │
│   To                                 │
│   Shielded balance · 0.50 ETH        │
│                                      │
│   ────────────────────────────────   │
│   Network fee      ~0.002 ETH        │
│   Time             ~2–3 min          │
│   Confirmations    2                 │
│                                      │
│   After: Public 0.74 · Shielded 0.50 │
│                                      │
│   [Shield funds]                     │
└──────────────────────────────────────┘
```

"2 confirmations" declared upfront — Rule 8, no surprises.
"After this operation" shows net result before user commits.

### Preparing transaction (ZKPoK, ~1–2s)

Button becomes inline state. No navigation.

```
│   [⏳ Preparing transaction…]
│   Encrypting your amount before sending.
```

### Wallet confirmation — Step 1/2

Tabs hidden. Left overlay: 50%.

```
┌──────────────────────────────────────┐
│   Shielding 0.50 ETH                 │
│   ● ─── ○ ─── ○ ─── ○               │
│   Auth    Confirm  Encrypt  Done     │
│                                      │
│   Confirm in your wallet             │
│   Step 1 of 2 — Authorization        │
│                                      │
│   ┌──────────────────────────────┐   │
│   │ Authorizing ShieldPay to     │   │
│   │ move 0.50 ETH from your      │   │
│   │ public balance.              │   │
│   │ Fee: ~0.002 ETH (~$4.70)     │   │
│   └──────────────────────────────┘   │
│                                      │
│   Your wallet will show a balance    │
│   decrease — this is correct.        │
│   Shielded balance updates after     │
│   the operation completes.           │
│                                      │
│   Not seeing a popup?                │
│   [Open MetaMask]                    │
│                                      │
│   [Cancel operation]                 │
└──────────────────────────────────────┘
```

### Wallet confirmation — Step 2/2

Auto-loads after Step 1 confirms (Rule 8 — no button click needed).

```
│   Shielding 0.50 ETH                 │
│   ● ─── ● ─── ○ ─── ○               │
│   Auth    Confirm  Encrypt  Done     │
│                                      │
│   Confirm in your wallet             │
│   Step 2 of 2 — Move funds           │
│                                      │
│   ┌──────────────────────────────┐   │
│   │ Approving transfer of 0.50   │   │
│   │ ETH to shielded balance.     │   │
│   │ Fee: ~0.003 ETH (~$7.05)     │   │
│   └──────────────────────────────┘   │
│                                      │
│   Not seeing a popup?                │
│   [Open MetaMask]                    │
│                                      │
│   [Cancel operation]                 │
```

### Processing — submitted + confirming

Left overlay: 30%.

```
│   Shielding 0.50 ETH                 │
│   ● ─── ● ─── ○ ─── ○               │
│   Auth    Confirm  Encrypt  Done     │
│                                      │
│   Moving your funds                  │
│                                      │
│   Your transaction is being          │
│   confirmed on the network.          │
│   Usually takes 1–2 minutes.         │
│                                      │
│   You can close this tab —           │
│   your balance updates automatically.│
│                                      │
│   0.50 ETH → Shielded balance        │
│   Started 30 seconds ago             │
│                                      │
│   [View on Etherscan ↗]              │
```

### Finalizing — encrypting balance

Left overlay: 30%.

```
│   Shielding 0.50 ETH                 │
│   ● ─── ● ─── ● ─── ○               │
│   Auth    Confirm  Encrypt  Done     │
│                                      │
│   Encrypting your balance            │
│                                      │
│   Your transaction is confirmed.     │
│   We're now encrypting your          │
│   shielded balance — ~1 min.         │
│                                      │
│   Your funds are safe. They will     │
│   appear in your shielded balance    │
│   once encryption completes.         │
│                                      │
│   You can close this tab.            │
│                                      │
│   You may see this as "Confirmed"    │
│   on Etherscan before your balance   │
│   updates — that's expected.         │
│                                      │
│   [View on Etherscan ↗]              │
```

### Success

Left overlay: 0%.

```
│   ✓  Funds shielded                  │
│   ● ─── ● ─── ● ─── ●               │
│                                      │
│   0.50 ETH added to your             │
│   shielded balance.                  │
│                                      │
│   Public balance    0.74 ETH (−0.50) │
│   Shielded balance  0.50 ETH (+0.50) │
│                                      │
│   [View on Etherscan ↗]              │
│                                      │
│   [Send shielded]    [Shield more]   │
```

Left balance cards animate their deltas.

### Failed — 3 copy variants, same layout

```
│   Something went wrong               │
│                                      │
│   Your funds are safe — nothing was  │
│   deducted from your balance.        │
│                                      │
│   [failure-specific copy]            │
│                                      │
│   [Try again]    [Contact support]   │
```

| Failure type | Specific copy |
|-------------|--------------|
| `failed_dropped` | "The transaction didn't go through — the network was congested. Retry with the same amount." |
| `failed_submission` | "The network rejected this transaction. This is usually temporary. Please try again." |
| `failed_finalization` | "An error occurred while encrypting your balance. Your public balance has been refunded." |

### Cancelled

```
│   Operation cancelled                │
│                                      │
│   No funds were moved. Your public   │
│   balance is unchanged.              │
│                                      │
│   [Try again]    [Done]              │
```

No error framing. Cancellation is a deliberate user choice.

---

## Right panel — Send shielded tab

### Idle form

```
┌──────────────────────────────────────┐
│   Shield      Send     Unshield      │
│              ──────                  │
│                                      │
│   To                                 │
│   ┌──────────────────────────────┐   │
│   │  0x recipient address…       │   │
│   └──────────────────────────────┘   │
│                                      │
│   Amount                             │
│   From shielded balance · 0.50 ETH   │
│   ┌──────────────────────────────┐   │
│   │  0.00                   ETH  │   │
│   └──────────────────────────────┘   │
│   [25%]  [50%]  [75%]  [Max]        │
│                                      │
│   ────────────────────────────────   │
│   Network fee      ~0.003 ETH        │
│   Time             ~2–3 min          │
│   Confirmations    1                 │
│                                      │
│   After: Shielded balance  0.40 ETH  │
│                                      │
│   [Send shielded]                    │
│                                      │
│   The recipient address must         │
│   support shielded tokens.           │
└──────────────────────────────────────┘
```

Single confirmation declared upfront.

### Preparing transaction

```
│   [⏳ Preparing transaction…]
│   Encrypting your amount before sending.
```

### Wallet confirmation — single step

Left overlay: 50%.

```
│   Sending 0.10 ETH                   │
│   ● ─── ○ ─── ○ ─── ○               │
│   Confirm  Submit  Encrypt  Done     │
│                                      │
│   Confirm in your wallet             │
│                                      │
│   ┌──────────────────────────────┐   │
│   │ Sending 0.10 ETH shielded    │   │
│   │ To: 0x3c4d…8e9f              │   │
│   │ Fee: ~0.003 ETH              │   │
│   └──────────────────────────────┘   │
│                                      │
│   The transaction amount is private. │
│   Only you and the recipient         │
│   can see it.                        │
│                                      │
│   Not seeing a popup?                │
│   [Open MetaMask]                    │
│                                      │
│   [Cancel operation]                 │
```

### Processing + finalizing

Left overlay: 30%. No Etherscan link (amounts encrypted, shows nothing meaningful).

```
│   Sending 0.10 ETH                   │
│   ● ─── ● ─── ● ─── ○               │
│                                      │
│   Encrypting transfer                │
│                                      │
│   Your transaction is confirmed.     │
│   The transfer is being encrypted    │
│   for sender and recipient — ~1 min. │
│                                      │
│   Your funds are safe.               │
│   You can close this tab.            │
│                                      │
│   Started 45 seconds ago             │
```

### Success

Left overlay: 0%.

```
│   ✓  Transfer sent                   │
│   ● ─── ● ─── ● ─── ●               │
│                                      │
│   0.10 ETH sent to                   │
│   0x3c4d…8e9f                        │
│                                      │
│   Shielded balance  0.40 ETH (−0.10) │
│                                      │
│   Only you and the recipient         │
│   can see this transaction.          │
│                                      │
│   [Send again]    [Done]             │
```

### Failed

```
│   Something went wrong               │
│                                      │
│   Your funds are safe — nothing      │
│   was deducted from your             │
│   shielded balance.                  │
│                                      │
│   The transaction didn't go          │
│   through. Please try again.         │
│                                      │
│   [Try again]    [Cancel]            │
```

### Cancelled

```
│   Transfer cancelled                 │
│                                      │
│   No funds were moved. Your          │
│   shielded balance is unchanged.     │
│                                      │
│   [Try again]    [Done]              │
```

---

## Right panel — Unshield tab

### Idle form

```
┌──────────────────────────────────────┐
│   Shield      Send     Unshield      │
│                        ────────      │
│                                      │
│   From                               │
│   Shielded balance · 0.50 ETH        │
│   ┌──────────────────────────────┐   │
│   │  0.00                   ETH  │   │
│   └──────────────────────────────┘   │
│   [25%]  [50%]  [75%]  [Max]        │
│                                      │
│   To                                 │
│   Public balance · 0.74 ETH current  │
│                                      │
│   ────────────────────────────────   │
│   Network fee      ~0.005 ETH        │
│   Time             ~3–5 min          │
│   Confirmations    2 — with a wait   │
│                                      │
│   After: Public 1.04 ETH             │
│           Shielded 0.20 ETH          │
│                                      │
│   [Unshield funds]                   │
└──────────────────────────────────────┘
```

"2 — with a wait" signals this operation is different upfront. The two confirmations are not back to back.

### Preparing transaction

```
│   [⏳ Preparing transaction…]
│   Encrypting your amount before sending.
```

### Wallet confirmation — Step 1/2

Left overlay: 50%.

```
│   Unshielding 0.30 ETH               │
│   ● ─── ○ ─── ○ ─── ○               │
│   Step 1  Wait  Step 2  Done         │
│                                      │
│   Confirm in your wallet             │
│   Step 1 of 2 — Remove from          │
│   shielded balance                   │
│                                      │
│   ┌──────────────────────────────┐   │
│   │ Removing 0.30 ETH from your  │   │
│   │ shielded balance.            │   │
│   │ Fee: ~0.002 ETH              │   │
│   └──────────────────────────────┘   │
│                                      │
│   After confirming, your shielded    │
│   balance will decrease. A second    │
│   confirmation releases the funds    │
│   to your public balance.            │
│                                      │
│   Not seeing a popup?                │
│   [Open MetaMask]                    │
│                                      │
│   [Cancel operation]                 │
```

Warning before Step 1 is critical — user must understand shielded balance will decrease before signing.

### Waiting for proof (system phase — no wallet)

Left overlay: 30%. Shielded balance already shows deduction.

```
│   Unshielding 0.30 ETH               │
│   ● ─── ● ─── ○ ─── ○               │
│   Step 1  Wait  Step 2  Done         │
│                                      │
│   Preparing release                  │
│                                      │
│   Step 1 is complete. We're now      │
│   preparing your funds for release   │
│   to your public balance.            │
│   This takes about 1–2 minutes.      │
│                                      │
│   Your funds are secured.            │
│   You can close this tab —           │
│   we'll notify you when Step 2       │
│   is ready.                          │
│                                      │
│   Shielded balance  0.20 ETH (−0.30) │
│   Public balance    0.74 ETH         │
│   (funds not released yet)           │
│                                      │
│   Started 30 seconds ago             │
```

"funds not released yet" prevents user from thinking the operation failed.

### Navigation warning — state 3 (soft)

Triggered when user tries to navigate away during this state.

```
┌─────────────────────────────────────────────┐
│   Your unshield is still in progress        │
│                                             │
│   If you leave now, your unshield will      │
│   be paused. You'll need to return to       │
│   complete Step 2 and release your funds.   │
│                                             │
│   Your funds are secured while you're away. │
│                                             │
│   [Stay]          [Leave anyway]            │
└─────────────────────────────────────────────┘
```

### Proof ready — action required

Left overlay: 50%.

```
│   ⚡  Action required                │
│   ● ─── ● ─── ● ─── ○               │
│   Step 1  Wait  Step 2  Done         │
│                                      │
│   Your unshield is ready to          │
│   complete.                          │
│                                      │
│   One more confirmation will         │
│   release 0.30 ETH to your           │
│   public balance.                    │
│                                      │
│   Your funds are secured.            │
│   Complete this step to              │
│   release them.                      │
│                                      │
│   [Complete unshield →]              │
```

### Navigation warning — state 4 (urgent)

```
┌─────────────────────────────────────────────┐
│   ⚡  Your unshield needs one more step      │
│                                             │
│   Step 2 is ready. If you leave now,        │
│   your funds stay secured but won't be      │
│   released until you return.                │
│                                             │
│   [Complete now]     [Leave anyway]         │
└─────────────────────────────────────────────┘
```

### Wallet confirmation — Step 2/2

Auto-triggers after "Complete unshield →". No extra click.

```
│   Unshielding 0.30 ETH               │
│   ● ─── ● ─── ● ─── ○               │
│   Step 1  Wait  Step 2  Done         │
│                                      │
│   Confirm in your wallet             │
│   Step 2 of 2 — Release funds        │
│                                      │
│   ┌──────────────────────────────┐   │
│   │ Releasing 0.30 ETH to your   │   │
│   │ public balance.              │   │
│   │ Fee: ~0.003 ETH              │   │
│   └──────────────────────────────┘   │
│                                      │
│   Not seeing a popup?                │
│   [Open MetaMask]                    │
│                                      │
│   [Cancel]                           │
```

### Finalizing

Left overlay: 30%.

```
│   Unshielding 0.30 ETH               │
│   ● ─── ● ─── ● ─── ○               │
│                                      │
│   Releasing to public balance        │
│                                      │
│   Almost done. Your funds are        │
│   being transferred to your          │
│   public balance — ~30 seconds.      │
│                                      │
│   You can close this tab.            │
│   [View on Etherscan ↗]              │
```

### Success

Left overlay: 0%.

```
│   ✓  Funds unshielded                │
│   ● ─── ● ─── ● ─── ●               │
│                                      │
│   0.30 ETH added to your             │
│   public balance.                    │
│                                      │
│   Public balance    1.04 ETH (+0.30) │
│   Shielded balance  0.20 ETH (−0.30) │
│                                      │
│   [View on Etherscan ↗]              │
│                                      │
│   [Unshield more]    [Done]          │
```

Both balance cards animate their deltas simultaneously.

### Failed — copy varies by phase

| When | Fund safety copy |
|------|-----------------|
| Before Step 1 confirms | "Your funds are safe — nothing was removed from your shielded balance." |
| After Step 1, during proof wait | "An error occurred. Your funds are secured. Contact support to complete the release." |
| Step 2 rejected by user | "Step 2 was cancelled. Your funds are secured. Return to complete the unshield." |

**Important:** After Step 1, do NOT say "Your funds are safe" — use "Your funds are secured" because they are in an intermediate state.

### Interrupted recovery (user returns after leaving state 3)

Right panel auto-detects `unwrapTxHash` in localStorage on app load.

```
│   ⚡  Unshield paused                │
│                                      │
│   You have an unfinished unshield    │
│   of 0.30 ETH from your last         │
│   session.                           │
│                                      │
│   Your funds are secured.            │
│                                      │
│   [Checking proof status…]           │
```

Resolves to:
- State 3 (Waiting for proof) if proof is still being generated
- State 4 (Proof ready) if proof is ready

**Three entry points to interrupted recovery:**

1. **StatusPersistenceBanner** (primary — amber, never dismissable):
   `⚡ Action required: Your unshield is paused — return to release your funds  [Complete →]`

2. **Right panel auto-detection on load**: reads localStorage, shows interrupted state automatically

3. **Shielded section activity row**:
   `[⚡] Unshielding 0.30 ETH   ● Action required   [Complete →]`
   Clicking row or button activates right panel in correct state

---

## Explore section — stub only

Explore is a sidebar item that signals product scalability. It is not developed for this submission.

```
│   Coming soon                        │
│                                      │
│   New products and features          │
│   will live here.                    │
```

Single stub screen. No interactive states.

---

## Flow comparison

| | Shield | Send shielded | Unshield |
|--|--------|--------------|----------|
| Wallet confirmations | 2 at start | 1 | 1 + 1 separated by wait |
| Tokens locked immediately | Yes (public −) | Yes (shielded −) | Yes (shielded burns at Step 1) |
| Intermediate state risk | Low | Low | High — funds in limbo |
| Etherscan link | Yes | No | Yes (Step 2 only) |
| Can cancel after first confirmation | No | No | No — must complete |
| Recovery needed | No | No | Yes — localStorage + resumeUnshield() |
| Phase indicator labels | Auth · Confirm · Encrypt · Done | Confirm · Submit · Encrypt · Done | Step 1 · Wait · Step 2 · Done |
