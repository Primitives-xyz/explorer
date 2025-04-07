import {
  ExtendedTransaction,
  Instruction,
  Transfer,
} from '@/components-new-version/models/helius.models'

export const getSourceIcon = (source: string) => {
  switch (source) {
    case 'MAGIC_EDEN':
      return '🪄'
    case 'TENSOR':
      return '⚡'
    case 'RAYDIUM':
      return '💧'
    case 'JUPITER':
      return '🌌'
    case 'SYSTEM_PROGRAM':
      return '💻'
    default:
      return null
  }
}

export const isSystemAccount = (address: string): boolean => {
  const systemAccounts = [
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K',
    'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  ]
  return systemAccounts.includes(address)
}

export const findNFTMintFromAccounts = (
  accounts: string[],
  sourceWallet: string
): string | null | undefined => {
  const potentialNFTs = accounts.filter(
    (address) =>
      address &&
      !address.startsWith('1111') &&
      address !== sourceWallet &&
      !isSystemAccount(address)
  )

  return potentialNFTs.length > 0 ? potentialNFTs[0] : null
}

export const findNFTMintFromTensorInstructions = (
  instructions: Instruction[]
): string | null => {
  // Find the Tensor buyCore instruction
  const tensorInstruction = instructions?.find(
    (ix) =>
      ix.programId === 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' &&
      ix.innerInstructions?.some(
        (inner) =>
          inner.programId === 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
      )
  )

  if (tensorInstruction?.innerInstructions) {
    // Find the Core instruction and get the NFT mint from its accounts
    const coreInnerInstruction = tensorInstruction.innerInstructions.find(
      (inner) =>
        inner.programId === 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
    )

    if (
      coreInnerInstruction?.accounts &&
      coreInnerInstruction.accounts.length >= 3
    ) {
      // The NFT mint is typically the first account in the Core instruction
      return coreInnerInstruction.accounts[0] ?? null
    }
  }
  return null
}

export const findNFTMintFromMetaplexInstructions = (
  instructions: Instruction[],
  sourceWallet: string,
  accountsInvolved?: string[]
): string | null => {
  const metaplexInstruction = instructions?.find(
    (ix) =>
      ix.programId === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K' &&
      ix.innerInstructions?.some(
        (inner) =>
          inner.programId === 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
      )
  )

  if (metaplexInstruction) {
    const coreInnerInstruction = metaplexInstruction.innerInstructions?.find(
      (inner) =>
        inner.programId === 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
    )

    if (coreInnerInstruction?.accounts) {
      return (
        coreInnerInstruction.accounts.find(
          (acc) =>
            accountsInvolved?.includes(acc) &&
            acc !== sourceWallet &&
            !acc.startsWith('1111') &&
            !isSystemAccount(acc)
        ) || null
      )
    }
  }
  return null
}

export const findNFTMintFromTokenTransfers = (
  tx: ExtendedTransaction
): string | null => {
  // First check if this is a Tensor transaction
  if (tx.source === 'TENSOR') {
    return findNFTMintFromTensorInstructions(tx.parsedInstructions || [])
  }

  // Fallback to existing token transfer logic
  if (!tx.tokenTransfers?.length) return null
  const nftTransfer = tx.tokenTransfers.find(
    (t) => t.tokenStandard === 'NonFungible'
  )
  return nftTransfer?.mint || null
}

export const getSaleAmount = (transfers: Transfer[]): number => {
  // For Tensor transactions, look for the maxAmount in the buyCore instruction
  if (transfers.length === 0) {
    return 0 // Hardcoded for testing, should come from instruction data
  }

  return transfers
    .filter((t) => t.amount > 0.005) // Filter out small transfers (fees)
    .reduce((max, t) => (t.amount > max ? t.amount : max), 0)
}

export const isNFTBuyTransaction = (
  tx: ExtendedTransaction,
  sourceWallet: string
): boolean => {
  // For Tensor transactions, check if it's a buyCore instruction
  if (tx.source === 'TENSOR') {
    return (
      tx.parsedInstructions?.some(
        (ix) =>
          ix.programId === 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' &&
          ix.decodedData?.name === 'buyCore'
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

export const LAMPORTS_PER_SOL = 1000000000

export const isSpamTransaction = (tx: any) => {
  // Check if it's a multi-transfer with tiny amounts
  if (
    tx.type === 'TRANSFER' &&
    tx.nativeTransfers &&
    tx.nativeTransfers.length > 3
  ) {
    // Check if all transfers are tiny amounts (less than 0.001 SOL)
    const allTinyTransfers = tx.nativeTransfers.every(
      (transfer: any) => Math.abs(transfer.amount / LAMPORTS_PER_SOL) < 0.001
    )
    if (allTinyTransfers) return true
  }
  return false
}
