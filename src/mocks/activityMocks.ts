import type { OperationPhase, OperationType } from '../types/operation'

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'

export const ETH_TOKEN = { symbol: 'ETH', imageUrl: `${ICON_BASE}/eth.png` }
export const USDC_TOKEN = { symbol: 'USDC', imageUrl: `${ICON_BASE}/usdc.png` }

export interface MockActivityEntry {
  id: string
  type: OperationType
  token: { symbol: string; imageUrl: string }
  amount: string
  status: OperationPhase
  date: number
  txHash?: string
}

const now = Date.now()

export const MOCK_ACTIVITY: MockActivityEntry[] = [
  // In-progress
  { id: 'ip-1', type: 'shield',   token: ETH_TOKEN, amount: '0.50', status: 'finalizing',  date: now - 120000,    txHash: '0xabc123' },
  { id: 'ip-2', type: 'unshield', token: ETH_TOKEN, amount: '0.30', status: 'proof_ready', date: now - 300000,    txHash: undefined  },
  // Completed
  { id: '1',    type: 'shield',   token: ETH_TOKEN, amount: '0.50', status: 'completed',   date: now - 86400000,  txHash: '0xabc123' },
  { id: '2',    type: 'unshield', token: ETH_TOKEN, amount: '0.20', status: 'completed',   date: now - 172800000, txHash: '0xdef456' },
  { id: '3',    type: 'send',     token: ETH_TOKEN, amount: '0.10', status: 'completed',   date: now - 259200000, txHash: undefined  },
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
