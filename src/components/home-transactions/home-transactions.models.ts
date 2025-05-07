import { EnrichedTransaction } from 'helius-sdk'
import { IProfile } from '../tapestry/models/profiles.models'

export enum EHomeTransactionFilter {
  ALL = 'all',
  FOLLOWING = 'swap',
  COMPRESSED_NFT_MINT = 'compressed_nft_mint',
  KOL = 'kol',
}

export enum ETransactionType {
  COMMENT = 'COMMENT',
  SWAP = 'SWAP',
  SOL_TRANSFER = 'SOL TRANSFER',
  SPL_TRANSFER = 'SPL TRANSFER',
  NFT = 'NFT',
  OTHER = 'OTHER',
}

export type IExtendedHeliusTransaction = Omit<EnrichedTransaction, 'type'> & {
  sourceWallet: string
  type: ETransactionType
}

export type IHomeTransaction = Omit<EnrichedTransaction, 'type'> & {
  profile?: IProfile
  sourceWallet: string
  type: ETransactionType
}

export interface IWalletLastTransaction {
  walletId: string
  signature: string
}
