import { BirdeyeTokenOverview } from '@/components-new-version/models/token.models'
import { useTokenInfo } from '@/components-new-version/token/hooks/use-token-info'
import { Card, CardContent, CardVariant } from '@/components-new-version/ui'
import isFungibleToken from '@/components-new-version/utils/helper'
import { formatNumber } from '@/components-new-version/utils/utils'
import { Globe } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'

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
    <div>
      <div className="pb-4 flex justify-between">
        <div
          className={`${
            overview &&
            (overview.extensions.website || overview.extensions.twitter)
              ? 'w-1/2'
              : 'w-full'
          }`}
        >
          <p>{about.description}</p>
        </div>
        {overview &&
          (overview.extensions.website || overview.extensions.twitter) && (
            <div className="w-1/2 flex flex-col items-end space-y-2">
              <Badge
                text={overview.extensions.website}
                icon={<Globe className="text-primary" size={16} />}
              />
              <Badge
                text={overview.extensions.twitter}
                icon={<Globe className="text-primary" size={16} />}
              />
            </div>
          )}
      </div>
      <div className="space-y-2">
        <p>Market Info</p>
        <Card variant={CardVariant.ACCENT}>
          <CardContent className="flex justify-between">
            <div className="space-y-1">
              <p>Decimals</p>
              <p>Token Program</p>
              <p>Markets</p>
              <p>Circulating Supply</p>
              <p>Total Supply</p>
            </div>
            <div className="space-y-1 text-right">
              <p>{about.decimals}</p>
              <p>{about.tokenProgram}</p>
              <p>{overview ? overview.numberMarkets : '...'}</p>

              {overview ? (
                <>
                  <p>
                    {`${formatNumber(overview.circulatingSupply)} 
                    
                    (${//to do the right calculation for the percentage
                    (
                      (overview.circulatingSupply /
                        overview.circulatingSupply) *
                      100
                    )
                      //----------------------
                      .toFixed(2)}%)`}
                  </p>
                </>
              ) : (
                <p>...</p>
              )}

              <p>{overview ? overview.supply : '...'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface BadgeProps {
  text?: string
  icon: ReactNode
}

export function Badge({ text, icon }: BadgeProps) {
  return (
    <div className="bg-primary/10 rounded-full h-8 flex items-center justify-center px-4 gap-2">
      {icon}
      <p className="text-xs text-primary font-bold">|</p>
      <p className="text-xs">{text}</p>
    </div>
  )
}
