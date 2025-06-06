'use client'

import { useProfileTransactions } from '@/components/profile/hooks/use-profile-transactions'
import { TransactionsEntry } from '@/components/transactions/transactions-entry'
import { Spinner } from '@/components/ui'
import { useEffect } from 'react'

interface Props {
  walletAddress: string
  transactionTypeSelected: string
  setTransactionTypes: (value: string[]) => void
}

export function ProfileTransactions({
  walletAddress,
  transactionTypeSelected,
  setTransactionTypes,
}: Props) {
  const { transactionTypes, loading, page, filteredTransactions } =
    useProfileTransactions({
      walletAddress,
      hasSearched: true,
    })

  useEffect(() => {
    setTransactionTypes(transactionTypes)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionTypes])

  return (
    <div>
      {loading && (
        <div className="my-4 w-full flex items-center justify-center">
          <Spinner />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredTransactions(transactionTypeSelected)?.map(
          (transaction, index) => (
            <TransactionsEntry
              key={index}
              transaction={transaction}
              walletAddress={walletAddress}
              displaySwap
              displayNft
              displaySolTransfer
              displayOther
            />
          )
        )}
      </div>

      {/* {!isLoading && transactions.length > 0 && (
        <div className="w-full flex justify-center my-4">
          <Button
            variant={ButtonVariant.GHOST}
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : 'load more'}
          </Button>
        </div>
      )} */}
    </div>
  )
}
