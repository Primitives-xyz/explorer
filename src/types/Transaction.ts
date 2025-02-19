export interface Transfer {
  from: string
  to: string
  amount: number
  mint?: string
}

export interface Transaction {
  type: string
  source: string
  description?: string
  fee: number
  timestamp: string
  transfers?: Transfer[]
  signature?: string
  success?: boolean
}
export type FeedTransaction = {
  type: string
  source: string
  description: string
  fee: number
  timestamp: string
  signature: string
  success: boolean
  walletAddress: string
  username: string
  from: { amount: number; token: string }
  to: { amount: number; token: string }
  accountsInvolved: string[]
}
