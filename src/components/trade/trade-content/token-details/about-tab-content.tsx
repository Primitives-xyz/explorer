import { BirdeyeTokenOverview } from '@/components/models/token.models'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
} from '@/components/ui'
import isFungibleToken from '@/utils/helper'
import { formatNumber } from '@/utils/utils'
import { Globe } from 'lucide-react'
import Image from 'next/image'
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
    <div>
      <div className="pb-4 flex justify-between">
        <div
          className={`${
            overview &&
            overview.extensions &&
            (overview.extensions.website || overview.extensions.twitter)
              ? 'w-1/2'
              : 'w-full'
          }`}
        >
          <p>{about.description}</p>
        </div>

        {overview &&
          overview.extensions &&
          (overview.extensions.website || overview.extensions.twitter) && (
            <div className="w-1/2 flex flex-col items-end space-y-2">
              <Button
                variant={ButtonVariant.BADGE}
                href={overview.extensions.twitter}
                newTab
              >
                <Image
                  src="/images/x.png"
                  width={16}
                  height={16}
                  alt="x-logo"
                  className="object-contain"
                />
                <p className="text-xs text-primary font-bold">|</p>
                <p className="text-xs">{overview.extensions.twitter}</p>
              </Button>

              <Button
                variant={ButtonVariant.BADGE}
                href={overview.extensions.website}
                newTab
              >
                <Globe className="text-primary" size={16} />
                <p className="text-xs text-primary font-bold">|</p>
                <p className="text-xs">{overview.extensions.website}</p>
              </Button>
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
                    
                    (${calculatePercentage(
                      overview.circulatingSupply,
                      overview.supply
                    )})`}
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
