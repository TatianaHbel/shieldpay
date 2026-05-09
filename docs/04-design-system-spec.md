# ShieldPay — Design System Specification

## Philosophy

Build components for states, not screens. Each component maps to a moment in the operation lifecycle. Screens are assembled from components — never the other way around.

**Architecture:** Three-zone desktop layout — collapsible sidebar (~220px) + left content column (flexible) + right panel (380px fixed). All financial operations happen inside the right panel. The left column is the information layer.

---

## Token foundation

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-public` | Indigo / #4F46E5 | Public balance, visible state |
| `--color-shielded` | Deep purple / #7C3AED | Shielded balance, encrypted state |
| `--color-success` | Green / #059669 | Completed states |
| `--color-warning` | Amber / #D97706 | Action required, attention |
| `--color-error` | Red / #DC2626 | Failure states |
| `--color-processing` | Cyan / #0891B2 | In-progress states |
| `--color-surface` | #0F0F1A | Dark base (crypto dark theme) |
| `--color-surface-raised` | #1A1A2E | Cards/panels |
| `--color-border` | #2A2A3E | Borders |
| `--color-text-primary` | #F0F0FF | Primary text |
| `--color-text-secondary` | #8B8BA7 | Supporting text |

### Typography

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-display` | 28px | 700 | Page headings |
| `--text-heading` | 20px | 600 | Card headings |
| `--text-body` | 16px | 400 | Body copy |
| `--text-small` | 14px | 400 | Labels, captions |
| `--text-mono` | 13px | 400 (mono) | Addresses, hashes |

### Spacing (4px base grid)

`--space-1: 4px` through `--space-12: 48px`

---

## Component catalog

Build in this order — foundation first, complex last.

### 1. `StatusBadge`

Inline badge for operation status.

**Variants:** `processing`, `success`, `failed`, `cancelled`, `pending`, `action-required`

`action-required` uses amber background with a pulse animation to indicate urgency.

Used in: activity rows, history feed, anywhere a compact status label is needed.

---

### 2. `PhaseIndicator`

A horizontal progress track showing the operation phases.

**NOT a numbered stepper** — users aren't doing steps; the system is.

**Props:**
- `phases`: string[] — phase label names
- `currentPhase`: index (0-based)
- `operation`: `'shield' | 'send' | 'unshield'`

**Design:** Horizontal track of named phase dots. Current phase highlighted; completed phases filled; upcoming phases empty. Labels always visible inline (not on hover only).

**Phase labels per operation:**

| Operation | Phase labels |
|-----------|-------------|
| Shield | Auth · Confirm · Encrypt · Done |
| Send shielded | Confirm · Submit · Encrypt · Done |
| Unshield | Step 1 · Wait · Step 2 · Done |

---

### 3. `BalanceCard`

Single balance display component. One card per balance type — public or shielded.

**Props:**
- `type`: `'public' | 'shielded'`
- `amount`: string
- `currency`: string
- `hidden`: boolean (shielded toggle — eye icon)
- `delta`: optional signed string ("+0.5 ETH" or "−0.3 ETH") for post-operation animation

**Visual anatomy:**
```
┌────────────────────────────────┐
│ [icon]  Public balance         │
│                                │
│   0.74 ETH                     │
│   ~$1,480.00                   │
│                       [token]  │
└────────────────────────────────┘
```

Shielded variant: amount replaced with "● ● ●" when `hidden=true`; eye-toggle icon in top right.

**Placement rules:**
- **Overview**: Both BalanceCards rendered side by side
- **Public section**: Public BalanceCard only
- **Shielded section**: Shielded BalanceCard only
- **Right panel "After" preview**: Compact inline text only ("After: Public 0.24 ETH · Shielded 0.50 ETH")

---

### 4. `ActivityRow`

One transaction history entry.

**Props:**
- `type`: `'shield' | 'send' | 'unshield'`
- `amount`: string
- `status`: OperationPhase
- `date`: timestamp
- `txHash`: optional string
- `hidden`: boolean (for encrypted transfer amounts)
- `onComplete`: optional handler (for action-required unshield rows)

**States:**
- `complete` — checkmark icon, muted timestamp, amount visible
- `in-progress` — spinner, phase label ("Encrypting…", "Waiting for proof…")
- `action-required` — amber pulse dot, inline "Complete →" CTA (Unshield only)
- `decrypting` — skeleton while amount is fetched and decrypted from chain

**Ordering rule:** In-progress rows always appear first in the activity feed, above all completed rows.

**Visual:**
```
[⟳]  Shielding         0.50 ETH    Encrypting…
[⚡]  Unshielding       0.30 ETH    Action required   [Complete →]
[✓]  Shielded          0.30 ETH    2 hours ago        [↗]
[✓]  Transfer sent     ● ● ● ETH   Yesterday
```

---

### 5. `StatusPersistenceBanner`

The persistent strip at the top of the left column when an operation is active and the user has navigated to a different section.

**Props:**
- `phase`: OperationPhase
- `operation`: OperationType
- `summary`: string (derived from phase + operation)
- `startedAt`: timestamp
- `onClick`: handler (focuses right panel)

**Visual:**
```
┌──────────────────────────────────────────────────────────┐
│  ⏳  Shielding in progress — Encrypting your balance     │
│      Started 4 minutes ago                    [View →]   │
└──────────────────────────────────────────────────────────┘
```

**Rules:**
- Lives in AppShell layout, not in routes — renders on every page while operation active
- Background color matches phase token: cyan = processing, amber = action-required, green = complete, red = failed
- Never auto-dismiss while operation is in progress
- Dismissable by user only after operation completes or failure is acknowledged
- `action-required` state uses amber with pulse; not dismissable until user completes the step
- Shows relative time since started ("Started 4 minutes ago")

---

### 6. `NavigationWarning`

Inline warning dialog that appears when the user tries to navigate away during an active Unshield operation.

**Props:**
- `urgency`: `'soft' | 'urgent'`
- `onStay`: handler
- `onLeave`: handler

**Soft — state 3 (waiting for proof):**
```
┌──────────────────────────────────────┐
│  Your unshield is still in progress  │
│  If you leave, it will be paused.    │
│  Your funds are secured while away.  │
│                                      │
│  [Stay]              [Leave anyway]  │
└──────────────────────────────────────┘
```

**Urgent — state 4 (proof ready):**
```
┌──────────────────────────────────────┐
│  Your unshield needs one more step   │
│  Step 2 is ready. Funds stay         │
│  secured but won't release until     │
│  you return.                         │
│                                      │
│  [Complete now]      [Leave anyway]  │
└──────────────────────────────────────┘
```

---

### 7. `ConnectWalletCard`

Entry screen component — the full-width card shown at `/connect`.

**States:**
- `landing` — wallet options list
- `wallet-selector` — expanded selector
- `connecting` — spinner + "Connecting…"
- `eip712-setup` — one-time onboarding: "Enable shielded access" (free, one time)
- `eip712-active` — signature prompt open in wallet
- `error` — connection failed with retry

The `eip712-setup` state is shown immediately after wallet connects (one time per device). It explains the free signature before the wallet popup opens, preventing confusion with a paid transaction.

---

### 8. `RightPanel`

The persistent transaction widget in the right zone (380px fixed). The most complex component in the system.

**Props:**
- `phase`: OperationPhase
- `operationType`: OperationType
- `onOverlayIntensity`: callback emitting `0 | 30 | 50`

**Tab bar**: Shield · Send · Unshield — hidden during any active operation phase.

**Operation forms (shown at `idle`):**

`ShieldForm` — amount input, From/To labels, fee, time estimate, confirmations count, "After" preview, primary CTA
`SendForm` — recipient address input, amount, fee, time estimate, confirmations count, "After" preview, recipient note, primary CTA
`UnshieldForm` — amount, From/To labels, fee, time estimate, "2 — with a wait between them" note, "After" preview, primary CTA

**Phase sub-components (shown during active operation):**

| Sub-component | Phase(s) |
|--------------|---------|
| Inline spinner on button | `preparing` |
| `WalletConfirmStep` | `awaiting_wallet_step1`, `awaiting_wallet_step2` |
| `ProcessingStep` | `submitted`, `processing`, `finalizing` |
| `ProofReadyStep` | `proof_ready` (Unshield only) |
| `SuccessStep` | `completed` |
| `FailedStep` | `failed_submission`, `failed_dropped`, `failed_finalization` |
| `CancelledStep` | `cancelled` |
| `InterruptedRecovery` | `interrupted` (Unshield only — shown on return after leaving mid-proof-wait) |

**Overlay intensity emitted to parent:**
```typescript
const overlayIntensity: Record<OperationPhase, 0 | 30 | 50> = {
  idle: 0,
  preparing: 0,
  awaiting_wallet_step1: 50,
  awaiting_wallet_step2: 50,
  submitted: 30,
  processing: 30,
  finalizing: 30,
  proof_ready: 50,
  completed: 0,
  failed_submission: 0,
  failed_dropped: 0,
  failed_finalization: 0,
  cancelled: 0,
  timed_out: 0,
  interrupted: 0,
}
```

**WalletConfirmStep visual anatomy:**
```
┌────────────────────────────────────────┐
│ Confirm in your wallet                 │
│ Step 1 of 2 — Authorization            │
│                                        │
│ Your wallet has a request waiting.     │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ Authorizing ShieldPay to move    │   │
│ │ 0.5 ETH from your public balance.│   │
│ │ Network fee: ~0.002 ETH          │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Not seeing a popup?                    │
│ [Click your wallet icon in browser]    │
│                                        │
│ [Cancel operation]                     │
└────────────────────────────────────────┘
```

---

### 9. `LeftColumnOverlay`

A div that covers the left content column with variable opacity during active operations. Creates visual focus on the right panel without hiding content entirely.

**Props:**
- `intensity`: `0 | 30 | 50`

**Behavior:**
- Opacity controlled via CSS transition (Framer Motion)
- At intensity > 0: `pointer-events: none` (left column becomes non-interactive)
- At intensity 0: `pointer-events: auto` (left column fully interactive)
- Background: `rgba(0, 0, 0, intensity/100)`

---

## Screen assembly map

| Route | Left column | Right panel default | Banner |
|-------|------------|---------------------|--------|
| `/connect` | `ConnectWalletCard` (full width) | Hidden | None |
| `/` (Overview) | Both `BalanceCard`s + `ActivityRow` list | `ShieldForm` | When active |
| `/public` | Public `BalanceCard` + activity | `ShieldForm` | When active |
| `/shielded` | Shielded `BalanceCard` + activity | `SendForm` | When active |
| `/explore` | Stub placeholder | `ShieldForm` | When active |
| `/design-system` | All components in all states | Hidden | None |

**Right panel states are NOT routes.** Managed by `useOperation` hook and rendered inside `RightPanel`. No page navigation occurs when the user initiates a transaction.

---

## Component rules

1. **Every design change is made at the component level** — never hardcode copy or styles into screen files
2. **`BalanceCard` is single per section** — Overview shows both; section pages show only their balance type
3. **`StatusPersistenceBanner` lives in AppShell** — not in routes; renders on any page while operation is active
4. **`RightPanel` is always mounted** — never unmount on route change; it persists state across navigation
5. **`FailedStep` always leads with fund safety** — "Your funds are safe" first when true; "secured" in intermediate Unshield state
6. **`WalletConfirmStep` always has a cancel path** — "Cancel operation" text link always present; never a primary button
7. **`PhaseIndicator` is never a numbered stepper** — named phase labels only
8. **In-progress `ActivityRow` always first** — above all completed rows in the activity feed
