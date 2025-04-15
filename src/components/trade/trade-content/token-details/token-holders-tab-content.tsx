'use client'

import { BirdeyeTokenOverview } from '@/components/models/token.models'
import { useTokenHolders } from '@/components/trade/hooks/use-token-holders'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
  Spinner,
} from '@/components/ui'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, cn, formatNumber } from '@/utils/utils'

interface TokenHoldersTabProps {
  id: string
  overview?: BirdeyeTokenOverview
}

export function TokenHoldersTabContent({ id, overview }: TokenHoldersTabProps) {
  const { holdersLoading, holders } = useTokenHolders(id)
  return (
    <div className="h-full">
      <div className="grid grid-cols-3 px-6 py-4 font-bold text-muted-foreground">
        <p>Trader</p>
        <p className="text-right">% Owned</p>
        <p className="text-right">Amount</p>
      </div>
      <div className="h-[250px] overflow-auto">
        {!holdersLoading ? (
          <div className="flex flex-col gap-2">
            {holders.map((holder, index) => (
              <Card key={index} variant={CardVariant.ACCENT_SOCIAL}>
                <CardContent className="grid grid-cols-3 w-full py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        {
                          'bg-secondary text-secondary-foreground border border-secondary':
                            index <= 2,
                          'text-secondary border border-secondary': index >= 3,
                        },
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold'
                      )}
                    >
                      #{index + 1}
                    </div>

                    {holder.address && (
                      <Button
                        variant={ButtonVariant.BADGE_SOCIAL}
                        size={ButtonSize.SM}
                        href={route('entity', {
                          id: holder.address,
                        })}
                      >
                        {abbreviateWalletAddress({
                          address: holder.address,
                        })}
                      </Button>
                    )}
                  </div>

                  <div className="text-right self-center">
                    {overview
                      ? (
                          (Number(holder.uiAmountString) / overview.supply) *
                          100
                        ).toFixed(2) + '%'
                      : 'N/A'}
                  </div>

                  <div className="text-right self-center">
                    {formatNumber(holder.uiAmountString)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  )
}
