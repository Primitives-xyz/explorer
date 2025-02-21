'use client'

import type { TransactionExplanation } from '@/hooks/useTransactionExplanation'
import { useTransactionExplanation } from '@/hooks/useTransactionExplanation'
import type { Transaction } from '@/utils/helius/types'
import {
  formatLamportsToSol,
  formatTokenAmount,
  getTokenSymbol,
} from '@/utils/transaction'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { TransactionBadge } from './transaction-badge'
import { TransactionCard } from './transaction-card'
import { TransactionSignature } from './transaction-signature'

interface TransactionDetailsProps {
  signature: string
}

export default function TransactionDetails({
  signature,
}: TransactionDetailsProps) {
  const [state, setState] = useState<{
    transaction: Transaction | null
    isLoading: boolean
    error: string | null
  }>({
    transaction: null,
    isLoading: true,
    error: null,
  })

  const {
    explanation: transactionExplanation,
    isLoading: transactionExplanationLoading,
    getExplanation,
  } = useTransactionExplanation()

  const t = useTranslations()

  useEffect(() => {
    if (!signature) return

    const fetchTransaction = async () => {
      try {
        const response = await fetch('/api/parse-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(
            typeof data.error === 'object'
              ? JSON.stringify(data.error)
              : data.error
          )
        }

        setState({ transaction: data, isLoading: false, error: null })
      } catch (err) {
        setState({
          transaction: null,
          isLoading: false,
          error:
            err instanceof Error
              ? err.message
              : t('error.failed_to_fetch_transaction'),
        })
      }
    }

    setState((prev) => ({ ...prev, isLoading: true }))
    fetchTransaction()
  }, [signature])

  async function handleTransactionExplanationClick() {
    if (state.transaction) {
      await getExplanation(state.transaction)
    }
  }

  const { transaction, isLoading, error } = state

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="font-mono text-center">
          {t('transaction_log.loading_transaction_details')}
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="py-8">
        <div className="text-red-500 font-mono text-center">
          {error || t('error.transaction_not_found')}
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-mono mb-2">
          {t('transaction_log.transaction_details')}
        </h1>
        <TransactionSignature signature={signature} />
      </div>

      <div className="mb-8">
        <button
          onClick={handleTransactionExplanationClick}
          className="uppercase px-4 py-1.5 border border-green-500/50  hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer flex-shrink-0"
        >
          {t('transaction_log.explain_transaction')}
        </button>

        {transactionExplanationLoading && (
          <div className="py-8">
            <div className="font-mono text-center">
              {t('transaction_log.loading_transaction_explanation')}
            </div>
          </div>
        )}
        {!transactionExplanationLoading && transactionExplanation && (
          <div className="mt-6 space-y-6 p-6 border-2 border-green-500/30 rounded-xl bg-black/60 shadow-lg shadow-green-900/20">
            {/* Key Points Summary */}
            <div>
              <h4 className="text-lg font-mono mb-4 text-green-400">
                {
                  (transactionExplanation as TransactionExplanation).summaries
                    .brief
                }
              </h4>

              <div className="space-y-2">
                <h5 className="text-sm font-mono uppercase tracking-wider text-green-400">
                  KEY POINTS
                </h5>
                {(
                  transactionExplanation as TransactionExplanation
                ).details.operations.map((op, index) => (
                  <div key={index} className="font-mono text-sm">
                    • {op.description}
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Explanation */}
            <div>
              <h5 className="text-sm font-mono uppercase tracking-wider text-green-400 mb-2">
                DETAILED EXPLANATION
              </h5>
              <p className="font-mono text-sm opacity-90">
                {
                  (transactionExplanation as TransactionExplanation).summaries
                    .detailed
                }
              </p>
            </div>

            {/* Technical Details */}
            <div className="space-y-4">
              <h5 className="text-sm font-mono uppercase tracking-wider text-green-400">
                TECHNICAL DETAILS
              </h5>

              {/* Protocols Used */}
              <div className="pl-4">
                <div className="text-sm font-mono mb-1">Protocols:</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-sm font-mono">
                    {
                      (transactionExplanation as TransactionExplanation)
                        .protocols.primary
                    }
                  </span>
                  {(
                    transactionExplanation as TransactionExplanation
                  ).protocols.integrated.map((protocol, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-900/20 border border-green-500/20 rounded-full text-sm font-mono opacity-80"
                    >
                      {protocol}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fees */}
              <div className="pl-4">
                <div className="text-sm font-mono mb-1">Fees:</div>
                <div className="space-y-1 font-mono text-sm opacity-90">
                  <div>
                    • Transaction Fee:{' '}
                    {
                      (transactionExplanation as TransactionExplanation).details
                        .fees.transactionFee
                    }
                  </div>
                  {(
                    transactionExplanation as TransactionExplanation
                  ).details.fees.protocolFees.map((fee, index) => (
                    <div key={index}>
                      • {fee.protocol}: {fee.amount} {fee.token}
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks if any */}
              {(transactionExplanation as TransactionExplanation).analysis.risks
                .length > 0 && (
                <div className="pl-4">
                  <div className="text-sm font-mono mb-1">Risks:</div>
                  <ul className="list-disc pl-4 space-y-1">
                    {(
                      transactionExplanation as TransactionExplanation
                    ).analysis.risks.map((risk, index) => (
                      <li key={index} className="font-mono text-sm opacity-90">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="text-sm font-mono mb-2">
            {t('transaction_log.timestamp')}
          </h3>
          <div className="text-xl font-mono">
            {formatDistanceToNow(new Date(transaction.timestamp * 1000))} ago
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="text-sm font-mono mb-2">
            {t('transaction_log.type')}
          </h3>
          <TransactionBadge
            type={transaction.type}
            source={transaction.source}
            size="md"
          />
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="text-sm font-mono mb-2">{t('transaction_log.fee')}</h3>
          <div className="text-xl font-mono">
            {formatLamportsToSol(transaction.fee)} SOL
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 bg-black/40 border border-green-800/40 rounded-xl">
        <h3 className="text-sm font-mono mb-2">
          {t('transaction_log.description')}
        </h3>
        <div className="font-mono">
          {transaction.description ||
            t('transaction_log.no_description_available')}
        </div>
      </div>

      <div className="mb-8 p-6 bg-black/40 border border-green-800/40 rounded-xl">
        <h3 className="text-sm font-mono mb-4">
          {t('transaction_log.account_changes')}
        </h3>
        <div className="space-y-3">
          {transaction.accountData
            .filter(
              (acc) =>
                acc.nativeBalanceChange !== 0 ||
                acc.tokenBalanceChanges.length > 0
            )
            .map((account, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 pb-3 border-b border-green-800/20 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono  text-sm">
                      {account.account}
                    </span>
                  </div>
                  {account.nativeBalanceChange !== 0 && (
                    <span
                      className={`font-mono text-sm ${
                        account.nativeBalanceChange > 0 ? '' : 'text-red-400'
                      }`}
                    >
                      {account.nativeBalanceChange > 0 ? '+' : ''}
                      {formatTokenAmount(account.nativeBalanceChange)} SOL
                    </span>
                  )}
                </div>
                {account.tokenBalanceChanges.map((change, changeIndex) => {
                  const amount =
                    Number(change.rawTokenAmount.tokenAmount) /
                    Math.pow(10, change.rawTokenAmount.decimals)
                  return (
                    <div
                      key={changeIndex}
                      className="flex items-center justify-between pl-4 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono ">
                          {change.tokenAccount}
                        </span>
                      </div>
                      <span
                        className={`font-mono ${
                          amount > 0 ? '' : 'text-red-400'
                        }`}
                      >
                        {amount > 0 ? '+' : ''}
                        {formatTokenAmount(
                          change.rawTokenAmount.tokenAmount,
                          change.rawTokenAmount.decimals
                        )}{' '}
                        {getTokenSymbol(change.mint)}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
        </div>
      </div>

      <div className="border border-green-800/40 rounded-xl bg-black/40">
        <TransactionCard
          transaction={transaction}
          sourceWallet={transaction.feePayer || ''}
        />
      </div>
    </div>
  )
}
