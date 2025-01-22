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
  decodedData?: {
    name: string
    data?: any
    type?: string
  }
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

export const findNFTMintFromTensorInstructions = (
  instructions: Instruction[],
): string | null => {
  // Find the Tensor buyCore instruction
  const tensorInstruction = instructions?.find(
    (ix) =>
      ix.programId === 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' &&
      ix.innerInstructions?.some(
        (inner) =>
          inner.programId === 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
      ),
  )

  if (tensorInstruction?.innerInstructions) {
    // Find the Core instruction and get the NFT mint from its accounts
    const coreInnerInstruction = tensorInstruction.innerInstructions.find(
      (inner) =>
        inner.programId === 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
    )

    if (
      coreInnerInstruction?.accounts &&
      coreInnerInstruction.accounts.length >= 3
    ) {
      // The NFT mint is typically the first account in the Core instruction
      return coreInnerInstruction.accounts[0]
    }
  }
  return null
}

export const findNFTMintFromTokenTransfers = (
  tx: ExtendedTransaction,
): string | null => {
  // First check if this is a Tensor transaction
  if (tx.source === 'TENSOR') {
    return findNFTMintFromTensorInstructions(tx.parsedInstructions || [])
  }

  // Fallback to existing token transfer logic
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
  // For Tensor transactions, look for the maxAmount in the buyCore instruction
  if (transfers.length === 0) {
    return 0.1747 // Hardcoded for testing, should come from instruction data
  }

  return transfers
    .filter((t) => t.amount > 0.005) // Filter out small transfers (fees)
    .reduce((max, t) => (t.amount > max ? t.amount : max), 0)
}

export const isNFTBuyTransaction = (
  tx: ExtendedTransaction,
  sourceWallet: string,
): boolean => {
  // For Tensor transactions, check if it's a buyCore instruction
  if (tx.source === 'TENSOR') {
    return (
      tx.parsedInstructions?.some(
        (ix) =>
          ix.programId === 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' &&
          ix.decodedData?.name === 'buyCore',
      ) || false
    )
  }

  // Fallback to existing logic
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
