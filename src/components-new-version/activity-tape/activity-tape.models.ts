export interface IGetFeedResponse {
  transactions: IGetFeedEntry[]
  total: number
}

export interface IGetFeedEntry {
  type: string
  source: string
  description: string
  fee: number
  timestamp: string
  signature: string
  success: boolean
  walletAddress: string
  username: string
  from: From
  to: To
  accountsInvolved: string[]
}

export interface From {
  amount: number
  token: string
}

export interface To {
  amount: number
  token: string
}

export interface IActivityTapeEntry {
  type: string
  text: string
  action: string
  wallet: string
  timestamp: number
  highlight: string
  amount: string
  amountSuffix: string
  isSSEBuy: boolean
  signature: string
}
