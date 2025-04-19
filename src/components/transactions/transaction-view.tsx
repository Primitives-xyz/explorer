'use client'

import { useTranslations } from 'next-intl'

interface TransactionDetailsProps {
  signature: string
}

export default function TransactionDetails({
  signature,
}: TransactionDetailsProps) {
  const t = useTranslations()

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-mono mb-2">
          {t('transaction_log.transaction_details')}
        </h1>
        <div className="font-mono text-sm text-gray-400">
          {signature}
        </div>
      </div>

      <div className="text-center py-12">
        <div className="flex gap-4 justify-center">
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg font-mono text-sm transition-colors"
          >
            View Transaction on Solscan
          </a>
          <a
            href={`http://solana.fm/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg font-mono text-sm transition-colors"
          >
            View Transaction on Solana.FM
          </a>
        </div>
      </div>
    </div>
  )
} 