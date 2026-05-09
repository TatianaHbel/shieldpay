# ShieldPay — Interaction Model

## Layout architecture

ShieldPay uses a **three-zone desktop layout**:

```
┌────────────┬──────────────────────────────┬──────────────────────┐
│  SIDEBAR   │  LEFT COLUMN                 │  RIGHT PANEL         │
│  ~220px    │  flexible                    │  ~380px fixed        │
│            │  balance + activity          │  transaction widget  │
└────────────┴──────────────────────────────┴──────────────────────┘
```

- **Sidebar**: Navigation (Overview, Public, Shielded, Explore) + wallet info. Collapsible to icon-only (~60px).
- **Left column**: Content for the active section — balance, activity feed, section-specific actions.
- **Right panel**: Persistent transaction widget. Always visible. Contains tabs: Shield · Send · Unshield. All transaction steps happen inside this panel.

This is a DeFi app model (Wise, Coinbase Exchange), not a wallet model. The user connects an external wallet (MetaMask/Rabby) to use ShieldPay. ShieldPay is the application layer.

---

## Where operations live

All financial operations live in the **right panel**. The left column is always the information layer — balance and history. The right panel is always the action layer.

### Right panel states per operation phase

| Phase | Right panel | Left column |
|-------|------------|-------------|
| `not_started` | Idle form (tabs visible) | Normal — no overlay |
| `awaiting_wallet_confirmation` | Wallet prompt (tabs hidden) | 50% overlay |
| `submitted` → `processing` | Phase indicator + copy | 30% overlay |
| `finalizing` | Phase indicator + encryption copy | 30% overlay |
| `proof_ready` (Unshield only) | Action required state | 50% overlay |
| `completed` | Success state | 0% overlay — balance cards animate |
| `failed_*` | Recovery state | 0% overlay |
| `cancelled` | Cancellation state | 0% overlay |

### Overlay intensity rules

Overlay intensity on the left column communicates urgency:

| Situation | Intensity | Reason |
|-----------|-----------|--------|
| Wallet confirmation required | 50% | User must act immediately |
| Proof ready (Unshield Step 2) | 50% | User must act to release funds |
| System processing (no user action needed) | 30% | Background — user can leave |
| Operation resolved | 0% | Full context restored |

---

## Component placement rules

| Use case | Component | Where |
|----------|-----------|-------|
| Initiating an operation | Right panel — idle form | Right panel |
| Wallet confirmation (any type) | Right panel — confirmation state | Right panel + left overlay |
| System processing | Right panel — processing state | Right panel + light overlay |
| Operation complete/failed | Right panel — result state | Right panel |
| Persistent operation reminder | `StatusPersistenceBanner` | Top of left column |
| Informational only (receive address) | Modal | Centered overlay — no overlay on left |
| Navigation warning (unshield) | Inline warning dialog | Centered, blocks navigation |

**The only case where a modal is appropriate is the "Add funds" receive address** — purely informational, no transaction risk, no consequence to dismissing.

**The StatusPersistenceBanner** lives at the top of the left column (not above the whole layout). It appears whenever an operation is active and the user has navigated to a different section. It is the secondary indicator — the right panel is the primary indicator.

---

## How progress is shown

Progress is shown in the right panel via a **PhaseIndicator** — a horizontal track of named phase dots.

Rules:
- Phases are named after what the **system** is doing, not what the user is doing
- Never numbered steps (users aren't doing steps)
- Current phase is highlighted; completed phases filled; upcoming phases empty
- Labels appear inline (not on hover) — always visible

### Phase labels per operation

| Operation | Phase labels |
|-----------|-------------|
| Shield | Auth · Confirm · Encrypt · Done |
| Send shielded | Confirm · Submit · Encrypt · Done |
| Unshield | Step 1 · Wait · Step 2 · Done |

---

## Wallet confirmation — handling rules

The wallet is external. We cannot control its UI.

**Before any wallet popup:**
- Right panel must show a pre-declaration screen: what is being approved, cost, which step of how many.
- Never let the wallet popup arrive without prior context in the panel (Rule 7).

**Types of wallet interactions and how to announce them:**

| Type | Cost | Panel copy before popup |
|------|------|------------------------|
| ERC-20 `approve()` | Yes — gas | "Authorizing ShieldPay to move [amount] from your public balance. Fee: ~[x] ETH" |
| `shield()` / `transfer()` / `unwrap()` / `finalizeUnwrap()` | Yes — gas | "Approving transfer of [amount] to [destination]. Fee: ~[x] ETH" |
| EIP-712 session signature | No | "To view your shielded balance, verify you own this wallet. This is free — no network fee." |

**If wallet doesn't open:**
- Always provide "Open [wallet] manually" fallback link in the right panel.

**If user cancels in wallet:**
- Do NOT treat as an error — it is a deliberate choice.
- Panel shows cancelled state: "Operation cancelled. No funds were moved."
- No red error styling. Neutral tone.

**Multi-step wallet flows (Shield = 2 confirmations):**
- Declare total steps before the first prompt: "2 confirmations required"
- After Step 1 confirms, auto-trigger Step 2 — no button click required (Rule 8)
- Panel shows "Step 1 of 2 / Step 2 of 2" progress inline

---

## The return state

When a user comes back to the app with an operation in progress:

**Primary indicator — Right panel:**
On app load, the right panel reads `localStorage`. If an active operation is found, the panel shows the current operation state — not the idle tabs. The user sees the operation status immediately without searching for it.

**Secondary indicator — StatusPersistenceBanner:**
Shown at the top of the left column on any section while an operation is active.

```
┌──────────────────────────────────────────────────────────┐
│ ⏳  Shielding in progress — Encrypting your balance (~1 min) │
│     Started 4 minutes ago                      [View →]  │
└──────────────────────────────────────────────────────────┘
```

Banner rules:
- Never auto-dismiss while operation is active
- Shows relative time since started
- Color matches operation state (cyan = processing, amber = action required, green = complete, red = failed)
- Clicking takes user to the right panel's current state

### Return state resolution logic

```
App loads
  │
  [S] Read localStorage for active operation
  │
  Found?
    YES → Right panel shows current operation state (not idle tabs)
          StatusPersistenceBanner shows in left column
    │
    ├── awaiting_wallet → Panel shows wallet confirmation prompt
    ├── submitted/processing/finalizing → Panel shows phase + ETA
    ├── proof_ready (unshield) → Panel shows "Action required"
    ├── completed → Panel shows success + banner (dismissable)
    └── failed → Panel shows recovery + banner
    │
    NO → Right panel shows idle tabs (Shield tab default)
         No banner
```

---

## Navigation warning — Unshield specific

The Unshield operation has an intermediate state (waiting for decryption proof) where the user can leave but must return. Two warning levels:

**During proof wait (state 3) — soft warning:**
Triggered when user clicks a sidebar item. Informs without blocking.
- Primary CTA: "Stay"
- Secondary: "Leave anyway"
- Copy: "Your unshield will be paused. Your funds are secured while you're away."

**During proof ready (state 4) — urgent warning:**
Triggered when user tries to navigate away while Step 2 is ready.
- Primary CTA: "Complete now"
- Secondary: "Leave anyway" (muted)
- Copy: "Step 2 is ready. Funds won't be released until you return."

---

## Mobile

Mobile layout is deferred for this submission. Desktop-first.

When implemented, mobile adaptations follow these principles:
- Right panel collapses to bottom sheet (slides up on action tap)
- Sidebar becomes bottom navigation bar
- StatusPersistenceBanner moves to top of screen (above content)
- Overlay behavior replaced with full-screen takeover for wallet confirmations

---

## What NOT to do

- ❌ Full-page navigation for financial operations — all operations live in the right panel
- ❌ Spinner with no copy (says nothing)
- ❌ "Transaction pending" without timeline or permission to leave
- ❌ Toast for errors that require user action
- ❌ Hiding the operation when the user navigates away
- ❌ Treating wallet cancel as an error
- ❌ Showing wallet popup without prior context in the panel
- ❌ Modal for financial operations (accidental dismiss is possible)
