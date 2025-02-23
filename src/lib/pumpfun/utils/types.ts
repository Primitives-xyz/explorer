import { RawMint } from "@solana/spl-token"
import { PublicKey, VersionedTransaction } from "@solana/web3.js"

export type BaseRayInput = {
  rpcEndpointUrl: string
}
export type Result<T, E = any | undefined> = {
  Ok?: T,
  Err?: E
}
export type MPLTokenInfo = {
  address: PublicKey
  mintInfo: RawMint,
  metadata: any
}


export type CreateTokenMetadata = {
  name: string
  symbol: string
  description: string
  file: Blob
  twitter?: string
  telegram?: string
  website?: string
  discord?: string
}

export type TokenMetadata = {
  name: string
  symbol: string
  description: string
  image: string
  showName: boolean
  createdOn: string
  twitter: string
}

export type CreateEvent = {
  name: string
  symbol: string
  uri: string
  mint: PublicKey
  bondingCurve: PublicKey
  user: PublicKey
}

export type TradeEvent = {
  mint: PublicKey
  solAmount: bigint
  tokenAmount: bigint
  isBuy: boolean
  user: PublicKey
  timestamp: number
  virtualSolReserves: bigint
  virtualTokenReserves: bigint
  realSolReserves: bigint
  realTokenReserves: bigint
}

export type CompleteEvent = {
  user: PublicKey
  mint: PublicKey
  bondingCurve: PublicKey
  timestamp: number
}

export type SetParamsEvent = {
  feeRecipient: PublicKey
  initialVirtualTokenReserves: bigint
  initialVirtualSolReserves: bigint
  initialRealTokenReserves: bigint
  tokenTotalSupply: bigint
  feeBasisPoints: bigint
}

export interface PumpFunEventHandlers {
  createEvent: CreateEvent
  tradeEvent: TradeEvent
  completeEvent: CompleteEvent
  setParamsEvent: SetParamsEvent
}

export type PumpFunEventType = keyof PumpFunEventHandlers

export type PriorityFee = {
  unitLimit: number
  unitPrice: number
}

export type TransactionResult = {
  success: boolean
  txObject?: string
  data?: any
  error?: any
}

export enum commitmentType {
  Finalized = "finalized",
  Confirmed = "confirmed",
  Processed = "processed"
}