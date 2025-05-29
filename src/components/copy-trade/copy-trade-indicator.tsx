'use client'

import { Badge } from '@/components/ui/badge'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui/button'
import Tooltip from '@/components/ui/tooltip'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, formatNumber } from '@/utils/utils'
import { CheckCircle, Clock, Copy, DollarSign, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CopyTradeIndicatorProps {
  transactionType?: string
  sourceWallet?: string
  sourceUsername?: string
  copyCount?: number
  paymentStatus?: string
  paymentAmount?: string
  profitUsd?: string
  copyDelay?: string
}

export function CopyTradeIndicator({
  transactionType,
  sourceWallet,
  sourceUsername,
  copyCount,
  paymentStatus,
  paymentAmount,
  profitUsd,
  copyDelay,
}: CopyTradeIndicatorProps) {
  const t = useTranslations()

  if (transactionType === 'copied' && sourceWallet) {
    // Build tooltip content string
    let tooltipContent = ''
    if (copyDelay) {
      tooltipContent += `${t('copy_trade.delay')}: ${Math.round(
        parseInt(copyDelay) / 1000
      )}s`
    }
    if (profitUsd && parseFloat(profitUsd) !== 0) {
      if (tooltipContent) tooltipContent += ' | '
      tooltipContent += `${t('copy_trade.profit')}: $${formatNumber(
        parseFloat(profitUsd)
      )}`
    }

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Tooltip content={tooltipContent || t('copy_trade.copied_trade')}>
          <Badge variant="secondary" className="gap-1">
            <Copy className="h-3 w-3" />
            {t('copy_trade.copied_from')}
            <Button
              variant={ButtonVariant.LINK}
              size={ButtonSize.SM}
              href={route('entity', { id: sourceWallet })}
              className="p-0 h-auto text-xs"
            >
              {sourceUsername
                ? `@${sourceUsername}`
                : abbreviateWalletAddress({
                    address: sourceWallet,
                    desiredLength: 6,
                  })}
            </Button>
          </Badge>
        </Tooltip>

        {paymentStatus && paymentStatus !== 'not_applicable' && (
          <Tooltip
            content={
              paymentStatus === 'paid'
                ? t('copy_trade.payment_sent')
                : t('copy_trade.payment_pending')
            }
          >
            <Badge
              variant={paymentStatus === 'paid' ? 'default' : 'outline'}
              className="gap-1"
            >
              {paymentStatus === 'paid' ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              <DollarSign className="h-3 w-3" />
              {paymentAmount && formatNumber(parseFloat(paymentAmount))}
            </Badge>
          </Tooltip>
        )}
      </div>
    )
  }

  if (transactionType === 'direct' && copyCount && copyCount > 0) {
    return (
      <Tooltip
        content={t('copy_trade.traders_copied_this', { count: copyCount })}
      >
        <Badge variant="default" className="gap-1">
          <Users className="h-3 w-3" />
          {t('copy_trade.copied_by', { count: copyCount })}
        </Badge>
      </Tooltip>
    )
  }

  return null
}
