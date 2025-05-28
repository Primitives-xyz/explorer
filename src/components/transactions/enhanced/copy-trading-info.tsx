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

  if (!isCopiedSwap(content)) return null

  const handleCopyTrade = () => {
    setOpen(true)
    setInputs({
      inputMint: content.inputMint,
      outputMint: content.outputMint,
      inputAmount: parseFloat(content.inputAmount),
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
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Copy Trading Information</CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Copy size={14} className="mr-1" />
            Copied Trade
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Original Trader Info */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
          <div className="flex items-center gap-4">
            <div className="cursor-pointer" onClick={navigateToProfile}>
              <Avatar
                username={content.sourceWalletUsername || content.sourceWallet}
                imageUrl={content.sourceWalletImage}
                size={56}
                className="h-14 w-14 ring-2 ring-purple-200"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Original Trader
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
            Copy This Trade
          </Button>
        </div>

        {/* Trade Flow */}
        <div className="bg-white rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Trade Flow
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
                  {content.sourceWalletUsername || 'Original Trader'}
                </span>
                <span className="text-xs text-muted-foreground">Source</span>
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
                  {content.walletUsername || 'You'}
                </span>
                <span className="text-xs text-muted-foreground">Copier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Trade Amount</p>
            <p className="text-lg font-semibold">
              {content.inputAmount} {content.inputTokenSymbol}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">
              Expected Output
            </p>
            <p className="text-lg font-semibold">
              {content.expectedOutput} {content.outputTokenSymbol}
            </p>
          </div>
        </div>

        {/* Performance Metrics (placeholder for future implementation) */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp size={16} />
            <span>Performance metrics coming soon</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
