'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { useIsMobile } from '@/utils/use-is-mobile'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FullPageSpinner } from '../ui'
import { AmbiguousTransactionView } from './ambiguous-transaction/ambiguous-transaction-view'
import { useTransactionDetails } from './hooks/use-transaction-details'
import { SwapTransactionView } from './swap-transaction/swap-transaction-view'
import { TransactionError } from './transaction-error'
import { TransactionLoading } from './transaction-loading'
import { TransactionNotFound } from './transaction-not-found'
import { TransferTransactionView } from './transfer-transaction/transfer-transaction-view'

interface TransactionDetailsProps {
  signature: string
}

export default function TransactionDetails({
  signature,
}: TransactionDetailsProps) {
  const t = useTranslations()
  const { transaction, isLoading, error } = useTransactionDetails(signature)
  const { isMobile } = useIsMobile()
  const { push } = useRouter()

  useEffect(() => {
    if (isMobile) {
      push('/trade')
    }
  }, [isMobile, push])

  // Fetch profiles for the fee payer when transaction is available
  const { profiles } = useGetProfiles({
    walletAddress: transaction?.feePayer || '',
  })

  const type_to_component_map = {
    SWAP: SwapTransactionView,
    TRANSFER: TransferTransactionView,
  }

  const renderTransactionContent = () => {
    if (isLoading) {
      return <TransactionLoading />
    }

    if (error) {
      return <TransactionError errorMessage={error.toString()} />
    }

    if (!transaction) {
      return <TransactionNotFound />
    }

    const TransactionComponent =
      type_to_component_map[
        transaction.type as keyof typeof type_to_component_map
      ] || AmbiguousTransactionView
    return <TransactionComponent transaction={transaction} />
  }

  if (isMobile) {
    return <FullPageSpinner />
  }

  return (
    <div className="overflow-visible mb-10">{renderTransactionContent()}</div>
  )
}
