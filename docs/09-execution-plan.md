# ShieldPay — Execution Plan

Deadline: **2026-05-12**

---

## Phase 1: Design System (Day 1–2)

**Goal:** Build all reusable components before building any screens. No screen should be built without all its components ready.

### Step 1 — Set up React project

```bash
npm create vite@latest shieldpay -- --template react-ts
cd shieldpay
npm install framer-motion lucide-react tailwindcss
```

### Step 2 — Define design tokens

Create `src/styles/tokens.css` with all color, type, and spacing tokens from `04-design-system-spec.md`.

### Step 3 — Build components (in this order)

Foundation first, complex last:

1. `StatusBadge` — simplest, foundational. Variants: processing, success, failed, cancelled, pending, action-required.
2. `PhaseIndicator` — horizontal phase track. NOT a stepper. Named phase dots. Props: `phases[]`, `currentPhase`, `operation`.
3. `BalanceCard` — single balance display (public or shielded). Props: `type`, `amount`, `currency`, `hidden`, `delta`.
4. `ActivityRow` — one transaction history row. States: complete, in-progress, action-required, decrypting. Props: `type`, `amount`, `status`, `date`, `txHash`, `hidden`.
5. `StatusPersistenceBanner` — top of left column. Props: `phase`, `operation`, `summary`, `startedAt`, `onClick`. Background color derived from phase.
6. `NavigationWarning` — inline warning dialog for Unshield navigation attempts. Props: `urgency` (soft|urgent), `onStay`, `onLeave`.
7. `ConnectWalletCard` — entry screen card. States: landing, wallet-selector, connecting, eip712-setup, eip712-active, error.
8. `RightPanel` — the persistent transaction widget. Contains:
   - Tab bar (Shield · Send · Unshield) — hidden during active operation
   - `ShieldForm` — amount input, from/to, fee, time, confirmations count, "After" preview
   - `SendForm` — recipient input, amount, fee, time, confirmations count, "After" preview
   - `UnshieldForm` — amount, from/to, fee, time, "2 — with a wait" note, "After" preview
   - `PreparingTx` — inline ZKPoK state (replaces submit button)
   - `WalletConfirmStep` — wallet confirmation state (tabs hidden, overlay active)
   - `ProcessingStep` — phase indicator + copy + ETA
   - `ProofReadyStep` — action required state (Unshield only)
   - `SuccessStep` — completed state with balance deltas
   - `FailedStep` — recovery state, fund safety first
   - `CancelledStep` — neutral cancellation state
   - `InterruptedRecovery` — Unshield resumed from localStorage
9. `LeftColumnOverlay` — div with opacity transition. Props: `intensity` (0|30|50).

### Step 4 — Design system page

Create `/design-system` route that renders every component in every state.
Structure: Tokens → each component heading → all variants side by side.
This is a deliverable artifact — Zama will see it at `[netlify-url]/design-system`.

---

## Phase 2: Screens (Day 3–4)

**Goal:** Assemble screens from design system components.

### App layout shell

Build the persistent shell first — everything else is mounted inside it:

```
AppShell
├── Sidebar (collapsible)
├── LeftColumn (content area — changes per route)
│   ├── StatusPersistenceBanner (conditional)
│   └── <Outlet /> (route content)
└── RightPanel (persistent — always mounted)
```

### Routes and screens

| Route | Left column content | Right panel default |
|-------|--------------------|--------------------|
| `/connect` | ConnectWalletCard (full) | Hidden |
| `/` | Overview: both balance cards + activity | Shield tab |
| `/public` | Public balance card + activity | Shield tab |
| `/shielded` | Shielded balance card + activity | Send tab |
| `/explore` | Stub placeholder | Shield tab |
| `/design-system` | All components in all states | Hidden |

**Right panel states are NOT routes.** They are managed by the `useOperation` hook and rendered inside `RightPanel`. No navigation occurs when the user initiates a transaction.

### State management

```typescript
// useOperation hook — manages all operation state
type OperationPhase =
  | 'idle'
  | 'preparing'
  | 'awaiting_wallet_step1'
  | 'awaiting_wallet_step2'
  | 'submitted'
  | 'processing'
  | 'finalizing'
  | 'proof_ready'       // Unshield only
  | 'completed'
  | 'failed_submission'
  | 'failed_dropped'
  | 'failed_finalization'
  | 'cancelled'
  | 'timed_out'
  | 'interrupted'       // Unshield only

type OperationType = 'shield' | 'send' | 'unshield'
```

### Simulation approach (no backend)

```typescript
// Shield simulation
const simulateShield = async () => {
  setPhase('preparing')
  await delay(1500)
  setPhase('awaiting_wallet_step1')
  await delay(2000)
  setPhase('awaiting_wallet_step2')   // auto-triggered after step 1
  await delay(2000)
  setPhase('submitted')
  await delay(3000)
  setPhase('processing')
  await delay(5000)
  setPhase('finalizing')
  await delay(4000)
  setPhase('completed')
}

// Unshield simulation
const simulateUnshield = async () => {
  setPhase('preparing')
  await delay(1500)
  setPhase('awaiting_wallet_step1')
  await delay(2000)
  setPhase('submitted')
  await delay(2000)
  setPhase('processing')              // waiting for proof
  await delay(6000)
  setPhase('proof_ready')             // user must return to act
  // --- user clicks "Complete unshield" ---
  setPhase('awaiting_wallet_step2')
  await delay(2000)
  setPhase('finalizing')
  await delay(3000)
  setPhase('completed')
}

// Random failure injection for demo (20% chance at processing phase)
if (Math.random() < 0.2) setPhase('failed_dropped')
```

### Persistence (localStorage)

```typescript
// Persist operation state so return-state flow works after page refresh
const STORAGE_KEY = 'shieldpay_active_operation'

// On phase change:
localStorage.setItem(STORAGE_KEY, JSON.stringify({
  type: operationType,       // 'shield' | 'send' | 'unshield'
  phase: currentPhase,
  amount: operationAmount,
  startedAt: timestamp,
  unwrapTxHash: txHash,      // Unshield only — needed for resumeUnshield()
}))

// On app load:
const saved = localStorage.getItem(STORAGE_KEY)
if (saved) restoreOperation(JSON.parse(saved))

// On completion/failure:
localStorage.removeItem(STORAGE_KEY)
```

### Overlay implementation

```typescript
// LeftColumnOverlay intensity derived from right panel phase
const overlayIntensity = {
  awaiting_wallet_step1: 50,
  awaiting_wallet_step2: 50,
  proof_ready: 50,
  submitted: 30,
  processing: 30,
  finalizing: 30,
  completed: 0,
  failed: 0,
  cancelled: 0,
  idle: 0,
}
```

---

## Phase 3: Polish and Testing (Day 5)

- All copy matches `03-content-design.md` — no Spanish, no jargon
- Every panel state answers the 3 questions (what / do what / if I leave)
- Return state flow: start operation → refresh page → right panel restores correct state
- Interrupted Unshield: start unshield → refresh at `processing` → right panel shows recovery
- Failure states: add a dev-only "Trigger failure" button in the panel for demo
- Navigation warning: verify it fires only during Unshield states 3 and 4
- Overlay intensity: verify transitions between states are smooth
- Empty states: verify Public and Shielded sections show correct empty state
- Activity row ordering: verify in-progress rows always appear first

---

## Phase 4: Deployment (Day 6)

### GitHub

```bash
git init
git remote add origin https://github.com/[username]/shieldpay-ux
git push -u origin main
```

### Netlify

1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist` (Vite)
4. Set up redirects for SPA: `/* /index.html 200`
5. Get shareable link

**Two URLs to deliver:**
- `[netlify-url]/` — the prototype
- `[netlify-url]/design-system` — the component library

---

## Phase 5: Case Study Write-up (Day 7)

Write the full case study covering all 9 deliverable sections from `00-project-brief.md`.
Reference the processed files — they are already structured to map to each deliverable section (see `README.md`).

The write-up can live in the GitHub repo README or as a separate PDF.

---

## Cursor prompt templates

### Design system build

```
I'm building the ShieldPay prototype — a frontend-only React + TypeScript app.
Layout: collapsible left sidebar + left content column + persistent right panel (380px).

Build the `RightPanel` component — the persistent transaction widget.

Requirements:
- Three tabs: Shield · Send · Unshield (hidden during active operation)
- Each tab has its own idle form (ShieldForm, SendForm, UnshieldForm)
- Operation phases managed by useOperation hook (phase prop passed in)
- Phase indicator: PhaseIndicator component with named phases per operation type
- Left column overlay: emit intensity value (0|30|50) to parent
- All phases covered: preparing, awaiting_wallet_step1, awaiting_wallet_step2,
  submitted, processing, finalizing, proof_ready, completed, failed_*, cancelled
- Dark theme — background: #1A1A2E (surface-raised token)

Reference: processed/04-design-system-spec.md for component spec
Reference: processed/03-content-design.md for copy per state
Reference: processed/01-state-system.md for phase enum
Reference: processed/12-screen-definitions.md for panel state wireframes
```

### Screen assembly

```
The design system is complete. Now assemble the Overview screen (/ route).

Requirements:
- AppShell with collapsible sidebar (Overview, Public, Shielded, Explore + wallet info)
- Left column: both BalanceCards (public visible, shielded hidden with eye toggle)
- StatusPersistenceBanner (conditional — renders when operation is active)
- Recent activity feed: ActivityRow components, in-progress rows first
- RightPanel mounted persistently on the right
- LeftColumnOverlay: opacity transitions based on right panel phase

Reference: processed/02-interaction-model.md for architecture
Reference: processed/12-screen-definitions.md for all screen states
Reference: processed/03-content-design.md for exact copy
```

---

## Key rule for all Cursor sessions

> Any design change is made at the component level. Never hardcode copy or styles into screen files. If the RightPanel needs updated copy for the `finalizing` phase, change the component — all screens update automatically.
>
> All documentation is in English. All copy in the UI is in English.
