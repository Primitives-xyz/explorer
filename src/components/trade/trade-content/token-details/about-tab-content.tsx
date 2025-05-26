import { BirdeyeTokenOverview } from '@/components/tapestry/models/token.models'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
} from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import isFungibleToken from '@/utils/helper'
import { Coins, ExternalLink, Globe, Info, Twitter } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AboutTabContentProps {
  id: string
  overview?: BirdeyeTokenOverview
}

interface AboutProps {
  description: string
  decimals: number
  tokenProgram: string
}

const defaultAbout = {
  description: '',
  decimals: 6,
  tokenProgram: '',
}

function calculatePercentage(
  part: number | undefined,
  total: number | undefined
): string {
  if (
    part === undefined ||
    total === undefined ||
    isNaN(part) ||
    isNaN(total) ||
    total === 0
  ) {
    return '0%'
  }

  const result = (part / total) * 100
  return `${result.toFixed(2)}%`
}

export function AboutTabContent({ id, overview }: AboutTabContentProps) {
  const { decimals: outputTokenDecimals, data: outputTokenData } =
    useTokenInfo(id)
  const [about, setAbout] = useState<AboutProps>(defaultAbout)

  useEffect(() => {
    if (outputTokenDecimals && outputTokenData) {
      setAbout({
        description: outputTokenData.result.content.metadata.description,
        decimals: outputTokenDecimals,
        tokenProgram: isFungibleToken(outputTokenData)
          ? outputTokenData.result.token_info.token_program
          : 'NONE',
      })
    }
  }, [outputTokenDecimals, outputTokenData])

  return (
    <div className="space-y-4">
      {/* Description and Social Links */}
      {(about.description || overview?.extensions) && (
        <div className="space-y-3">
          {about.description && (
            <p className="text-sm text-muted-foreground">{about.description}</p>
          )}

          {overview?.extensions && (
            <div className="flex flex-wrap gap-2">
              {overview.extensions.twitter && (
                <Button
                  variant={ButtonVariant.BADGE}
                  href={overview.extensions.twitter}
                  newTab
                  className="h-8"
                >
                  <Twitter size={14} />
                  <span className="text-xs">Twitter</span>
                </Button>
              )}
              {overview.extensions.website && (
                <Button
                  variant={ButtonVariant.BADGE}
                  href={overview.extensions.website}
                  newTab
                  className="h-8"
                >
                  <Globe size={14} />
                  <span className="text-xs">Website</span>
                </Button>
              )}
              {overview.extensions.telegram && (
                <Button
                  variant={ButtonVariant.BADGE}
                  href={overview.extensions.telegram}
                  newTab
                  className="h-8"
                >
                  <ExternalLink size={14} />
                  <span className="text-xs">Telegram</span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Supply and Token Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card variant={CardVariant.ACCENT}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Coins size={16} className="text-muted-foreground" />
              <h3 className="font-semibold">Supply Info</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Circulating Supply
                </span>
                <span className="text-sm font-medium">
                  {overview ? (
                    <div className="text-right">
                      <div>
                        {formatSmartNumber(overview.circulatingSupply, {
                          compact: true,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {calculatePercentage(
                          overview.circulatingSupply,
                          overview.supply
                        )}{' '}
                        of total
                      </div>
                    </div>
                  ) : (
                    '...'
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Supply
                </span>
                <span className="text-sm font-medium">
                  {overview
                    ? overview.supply > 0
                      ? formatSmartNumber(overview.supply, { compact: true })
                      : overview.circulatingSupply > 0
                      ? formatSmartNumber(overview.circulatingSupply, {
                          compact: true,
                        })
                      : 'N/A'
                    : '...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">FDV</span>
                <span className="text-sm font-medium">
                  {overview
                    ? overview.realMc > 0
                      ? `$${formatSmartNumber(overview.realMc, {
                          compact: true,
                        })}`
                      : overview.price > 0 && overview.supply > 0
                      ? `$${formatSmartNumber(
                          overview.price * overview.supply,
                          { compact: true }
                        )}`
                      : overview.price > 0 && overview.circulatingSupply > 0
                      ? `$${formatSmartNumber(
                          overview.price * overview.circulatingSupply,
                          { compact: true }
                        )}`
                      : 'N/A'
                    : '...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant={CardVariant.ACCENT}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-muted-foreground" />
              <h3 className="font-semibold">Token Info</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Symbol</span>
                <span className="text-sm font-medium">
                  {overview?.symbol || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Decimals</span>
                <span className="text-sm font-medium">{about.decimals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Token Program
                </span>
                <span
                  className="text-sm font-medium truncate max-w-[150px]"
                  title={about.tokenProgram}
                >
                  {about.tokenProgram || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contract</span>
                <Button
                  variant={ButtonVariant.BADGE}
                  href={`https://solscan.io/token/${id}`}
                  newTab
                  className="h-6 text-xs"
                >
                  View on Solscan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Trading Info */}
      {overview && (
        <Card variant={CardVariant.ACCENT}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Trading Activity</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">24h Trades</p>
                <p className="text-sm font-medium">
                  {formatSmartNumber(overview.trade24h, { compact: true })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Markets</p>
                <p className="text-sm font-medium">{overview.numberMarkets}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  24h Active Wallets
                </p>
                <p className="text-sm font-medium">
                  {formatSmartNumber(overview.uniqueWallet24h, {
                    compact: true,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
