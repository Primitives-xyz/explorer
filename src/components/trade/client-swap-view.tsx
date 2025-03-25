'use client'

import { SwapTransactionView } from '@/components/transactions/swap-transaction-view'
import type { Transaction } from '@/utils/helius/types'

interface ClientSwapViewProps {
  tx: Transaction
  sourceWallet: string
  fromMint?: string
  toMint?: string
}

export default function ClientSwapView({
  tx,
  sourceWallet,
}: ClientSwapViewProps) {
  return <SwapTransactionView tx={tx} sourceWallet={sourceWallet} />
}
