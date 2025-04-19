'use client'

import { Button, ButtonVariant, Heading1, Paragraph } from '@/components/ui'
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
        <Heading1>
          {t('transaction_log.transaction_details')}
        </Heading1>
        <Paragraph className="text-muted-foreground font-mono">
          {signature}
        </Paragraph>
      </div>

      <div className="py-12">
        <div className="flex gap-4">
          <Button
            variant={ButtonVariant.SECONDARY}
            href={`https://solscan.io/tx/${signature}`}
            newTab
          >
            View Transaction on Solscan
          </Button>
          <Button
            variant={ButtonVariant.SECONDARY_SOCIAL}
            href={`http://solana.fm/tx/${signature}`}
            newTab
          >
            View Transaction on Solana.FM
          </Button>
        </div>
      </div>
    </div>
  )
} 