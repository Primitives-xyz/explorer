import { Transaction, AccountData } from '@/utils/helius/types'

interface Transfer {
  to: string
  from: string
  amount: number
}

interface Instruction {
  programId: string
  accounts: string[]
  data: string
  innerInstructions?: {
    programId: string
    accounts: string[]
    data: string
  }[]
}

interface TokenTransfer {
  fromTokenAccount: string
  toTokenAccount: string
  fromUserAccount: string
  toUserAccount: string
  tokenAmount: number
  mint: string
  tokenStandard: string
}

export interface ExtendedTransaction
  extends Omit<
    Transaction,
    'nativeTransfers' | 'tokenTransfers' | 'accountData' | 'balanceChanges'
  > {
  transfers?: Transfer[]
  instructions?: Instruction[]
  parsedInstructions?: Instruction[]
  accountData?: AccountData[]
  accountsInvolved?: string[]
  nativeTransfers?: {
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }[]
  balanceChanges?: { [address: string]: number }
  tokenTransfers?: TokenTransfer[]
}

export const findNFTMintFromTokenTransfers = (
  tx: ExtendedTransaction,
): string | null => {
  if (!tx.tokenTransfers?.length) return null
  const nftTransfer = tx.tokenTransfers.find(
    (t) => t.tokenStandard === 'NonFungible',
  )
  return nftTransfer?.mint || null
}

export const findNFTMintFromMetaplexInstructions = (
  instructions: Instruction[],
  sourceWallet: string,
  accountsInvolved?: string[],
): string | null => {
  const metaplexInstruction = instructions?.find(
    (ix) =>
      ix.programId === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K' &&
      ix.innerInstructions?.some(
        (inner) =>
          inner.programId === 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
      ),
  )

  if (metaplexInstruction) {
    const coreInnerInstruction = metaplexInstruction.innerInstructions?.find(
      (inner) =>
        inner.programId === 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
    )

    if (coreInnerInstruction?.accounts) {
      return (
        coreInnerInstruction.accounts.find(
          (acc) =>
            accountsInvolved?.includes(acc) &&
            acc !== sourceWallet &&
            !acc.startsWith('1111') &&
            !isSystemAccount(acc),
        ) || null
      )
    }
  }
  return null
}

export const findNFTMintFromAccounts = (
  accounts: string[],
  sourceWallet: string,
): string | null => {
  const potentialNFTs = accounts.filter(
    (address) =>
      address &&
      !address.startsWith('1111') &&
      address !== sourceWallet &&
      !isSystemAccount(address),
  )

  return potentialNFTs.length > 0 ? potentialNFTs[0] : null
}

export const isSystemAccount = (address: string): boolean => {
  const systemAccounts = [
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K',
    'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  ]
  return systemAccounts.includes(address)
}

export const getSaleAmount = (transfers: Transfer[]): number => {
  return transfers
    .filter((t) => t.amount > 0.005) // Filter out small transfers (fees)
    .reduce((max, t) => (t.amount > max ? t.amount : max), 0)
}

export const isNFTBuyTransaction = (
  tx: ExtendedTransaction,
  sourceWallet: string,
): boolean => {
  const transfers = normalizeTransfers(tx)
  return tx.type === 'DEPOSIT' || transfers.some((t) => t.to === sourceWallet)
}

export const normalizeTransfers = (tx: ExtendedTransaction): Transfer[] => {
  return (
    tx.transfers ||
    tx.nativeTransfers?.map((t) => ({
      from: t.fromUserAccount,
      to: t.toUserAccount,
      amount: t.amount,
    })) ||
    []
  )
}
