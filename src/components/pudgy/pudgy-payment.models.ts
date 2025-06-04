export interface IPudgyUpgradeInitiateResponse {
  amount: number
  tokenSymbol: string
  memo: string
}

export interface IPudgyUpgradeCallbackInput {
  txSignature: string
  pudgyProfileId: string
  txId: string
}

export interface IPudgyUpgradeCallbackResponse {
  success: boolean
}

export enum ECryptoTransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ICryptoChallengePaymentStatus {
  status: ECryptoTransactionStatus
  errorReason?: string
}
