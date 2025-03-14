export interface ITransaction {
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

export interface IActivity {
  type: string
  text: string
  action: string
  wallet: string
  timestamp: number
  highlight: string
  amount?: string
  amountSuffix?: string
  isSSEBuy?: boolean
  signature?: string
}
