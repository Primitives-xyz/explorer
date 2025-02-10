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
