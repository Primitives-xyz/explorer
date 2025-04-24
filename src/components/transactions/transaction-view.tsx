'use client'
import { useTransactionDetails } from './hooks/use-transaction-details'
import { useTranslations } from 'next-intl'
import { TransactionLoading } from './transaction-loading'
import { TransactionError } from './transaction-error'
import { TransactionNotFound } from './transaction-not-found'
import { SwapTransactionView } from './swap-transaction/swap-transaction-view'
import { AmbiguousTransactionView } from './ambiguous-transaction/ambiguous-transaction-view'
import { TransferTransactionView } from './transfer-transaction/transfer-transaction-view'
import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
interface TransactionDetailsProps {
  signature: string
}

export default function TransactionDetails({
  signature,
}: TransactionDetailsProps) {
  const t = useTranslations()
  const { transaction, isLoading, error } = useTransactionDetails(signature)
  
  // Fetch profiles for the fee payer when transaction is available
  const { profiles } = useGetProfiles({
    walletAddress: transaction?.feePayer || ''
  })
  
  const type_to_component_map = {
    "SWAP": SwapTransactionView,
    "TRANSFER": TransferTransactionView,
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

    const TransactionComponent = type_to_component_map[transaction.type as keyof typeof type_to_component_map] || AmbiguousTransactionView
    return <TransactionComponent transaction={transaction} />
  }

  return (
    <div className="overflow-visible mb-10">
      {renderTransactionContent()}
    </div>
  )
} 