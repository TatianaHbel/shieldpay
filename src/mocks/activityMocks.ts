import type { OperationPhase, OperationType } from '../types/operation'

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'

export const ETH_TOKEN   = { symbol: 'ETH',   imageUrl: `${ICON_BASE}/eth.png`  }
export const USDC_TOKEN  = { symbol: 'USDC',  imageUrl: `${ICON_BASE}/usdc.png` }
export const DAI_TOKEN   = { symbol: 'DAI',   imageUrl: `${ICON_BASE}/dai.png`  }

// Shielded counterparts — same icon, prefixed symbol
export const cETH_TOKEN  = { symbol: 'cETH',  imageUrl: `${ICON_BASE}/eth.png`  }
export const cUSDC_TOKEN = { symbol: 'cUSDC', imageUrl: `${ICON_BASE}/usdc.png` }
export const cDAI_TOKEN  = { symbol: 'cDAI',  imageUrl: `${ICON_BASE}/dai.png`  }

export interface MockActivityEntry {
  id: string
  type: OperationType
  token: { symbol: string; imageUrl: string }
  pairedToken?: { symbol: string; imageUrl: string }
  amount: string
  status: OperationPhase
  date: number
  txHash?: string
  direction?: 'in' | 'out'
  counterparty?: string
}

const now = Date.now()

export const MOCK_ACTIVITY: MockActivityEntry[] = [
  // In-progress
  {
    id: 'ip-1',
    type: 'shield',
    token: USDC_TOKEN,
    pairedToken: cUSDC_TOKEN,
    amount: '500.00',
    status: 'finalizing',
    date: now - 120000,
    txHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  },
  {
    id: 'ip-2',
    type: 'unshield',
    token: cUSDC_TOKEN,
    pairedToken: USDC_TOKEN,
    amount: '200.00',
    status: 'proof_ready',
    date: now - 300000,
  },
  // Completed
  {
    id: '1',
    type: 'shield',
    token: USDC_TOKEN,
    pairedToken: cUSDC_TOKEN,
    amount: '500.00',
    status: 'completed',
    date: now - 86400000,
    txHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  },
  {
    id: '2',
    type: 'unshield',
    token: cUSDC_TOKEN,
    pairedToken: USDC_TOKEN,
    amount: '200.00',
    status: 'completed',
    date: now - 172800000,
    txHash: '0xdef456abc123def456abc123def456abc123def456abc123def456abc123def4',
  },
  {
    id: '3',
    type: 'send',
    token: cETH_TOKEN,
    amount: '0.10',
    status: 'completed',
    date: now - 259200000,
    counterparty: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  },
  // Failed
  {
    id: 'fail-1',
    type: 'shield',
    token: ETH_TOKEN,
    pairedToken: cETH_TOKEN,
    amount: '0.5',
    status: 'failed_dropped',
    date: now - 43200000,
  },
  {
    id: 'fail-2',
    type: 'shield',
    token: DAI_TOKEN,
    pairedToken: cDAI_TOKEN,
    amount: '100.00',
    status: 'failed_finalization',
    date: now - 604800000,
  },
]

export const IN_PROGRESS_STATUSES = new Set<OperationPhase>([
  'preparing',
  'awaiting_wallet_step1',
  'awaiting_wallet_step2',
  'submitted',
  'processing',
  'finalizing',
  'proof_ready',
])
