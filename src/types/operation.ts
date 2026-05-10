export type OperationPhase =
  | 'idle'
  | 'preparing'
  | 'awaiting_wallet_step1'
  | 'awaiting_wallet_step2'
  | 'submitted'
  | 'processing'
  | 'finalizing'
  | 'proof_ready'
  | 'completed'
  | 'failed_submission'
  | 'failed_dropped'
  | 'failed_finalization'
  | 'cancelled'
  | 'timed_out'
  | 'interrupted'

export type OperationType = 'shield' | 'send' | 'unshield'

export interface ActiveOperation {
  type: OperationType
  phase: OperationPhase
  amount: string
  startedAt: number
  txHashStep1?: string
  txHashStep2?: string
}
