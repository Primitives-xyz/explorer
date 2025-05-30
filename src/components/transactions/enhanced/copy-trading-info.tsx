'use client'

import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { Transaction } from '@/components/tapestry/models/helius.models'
import { Avatar } from '@/components/ui/avatar/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionContent, isCopiedSwap } from '@/types/content'
import { ArrowRight, Copy, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface CopyTradingInfoProps {
  content: TransactionContent
  transaction: Transaction
}

export function CopyTradingInfo({
  content,
  transaction,
}: CopyTradingInfoProps) {
  const { setOpen, setInputs } = useSwapStore()
  const router = useRouter()
  const t = useTranslations()

  if (!isCopiedSwap(content)) return null

  const handleCopyTrade = () => {
    setOpen(true)
    setInputs({
      inputMint: content.inputMint,
      outputMint: content.outputMint,
      inputAmount: parseFloat(content.inputAmount),
      sourceWallet: content.sourceWallet,
      sourceTransactionId: content.txSignature,
    })
  }

  const navigateToProfile = () => {
    if (content.sourceWalletUsername) {
      router.push(`/@${content.sourceWalletUsername}`)
    } else {
      router.push(`/${content.sourceWallet}`)
    }
  }

  return (
    <Card className="border-border/50 bg-muted/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {t('copy_trading.info_title')}
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-muted text-muted-foreground border border-border/50"
          >
            <Copy size={14} className="mr-1" />
            {t('common.copied')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Original Trader Info */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50">
          <div className="flex items-center gap-4">
            <div className="cursor-pointer" onClick={navigateToProfile}>
              <Avatar
                username={content.sourceWalletUsername || content.sourceWallet}
                imageUrl={content.sourceWalletImage}
                size={56}
                className="h-14 w-14 ring-2 ring-border"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {t('copy_trading.original_trader')}
              </p>
              <div className="flex items-center gap-2">
                {content.sourceWalletUsername ? (
                  <button
                    onClick={navigateToProfile}
                    className="text-base font-semibold text-primary hover:underline"
                  >
                    @{content.sourceWalletUsername}
                  </button>
                ) : (
                  <SolanaAddressDisplay
                    address={content.sourceWallet}
                    highlightable={true}
                    showCopyButton={false}
                    displayAbbreviatedAddress={true}
                    className="text-sm"
                  />
                )}
              </div>
            </div>
          </div>
          <Button onClick={handleCopyTrade} size="default" variant="default">
            <Copy size={16} className="mr-2" />
            {t('copy_trading.copy_this_trade')}
          </Button>
        </div>

        {/* Trade Flow */}
        <div className="bg-background rounded-lg p-6 border border-border/50">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            {t('copy_trading.trade_flow')}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                username={content.sourceWalletUsername || content.sourceWallet}
                imageUrl={content.sourceWalletImage}
                size={40}
                className="h-10 w-10"
              />
              <div>
                <span className="text-sm font-medium block">
                  {content.sourceWalletUsername ||
                    t('copy_trading.original_trader')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('copy_trading.source')}
                </span>
              </div>
            </div>
            <ArrowRight className="text-muted-foreground mx-4" size={24} />
            <div className="flex items-center gap-3">
              <Avatar
                username={content.walletUsername || content.walletAddress}
                imageUrl={content.walletImage}
                size={40}
                className="h-10 w-10"
              />
              <div>
                <span className="text-sm font-medium block">
                  {content.walletUsername || t('copy_trading.you')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('copy_trading.copier')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">
              {t('copy_trading.trade_amount')}
            </p>
            <p className="text-lg font-semibold">
              {content.inputAmount} {content.inputTokenSymbol}
            </p>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">
              {t('copy_trading.expected_output')}
            </p>
            <p className="text-lg font-semibold">
              {content.expectedOutput} {content.outputTokenSymbol}
            </p>
          </div>
        </div>

        {/* Performance Metrics (placeholder for future implementation) */}
        <div className="bg-background rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp size={16} />
            <span>{t('copy_trading.performance_coming_soon')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
