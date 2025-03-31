import { BirdeyeTokenOverview, useBirdeyeTokenOverview } from '@/components-new-version/hooks/use-birdeye-token-overview'
import { useTokenInfo } from '@/components-new-version/token/hooks/use-token-info'
import isFungibleToken from '@/components-new-version/utils/helper'
import { formatNumber } from '@/components-new-version/utils/utils'
import { Globe, X } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'

interface AboutTabContentProps {
  id: string,
  overview?: BirdeyeTokenOverview,
}

interface AboutProps {
  description: string
  decimals: number
  tokenProgram: string
}

const defaultAbout = {
  description: "",
  decimals: 6,
  tokenProgram: ""
}

export function AboutTabContent({ id, overview }: AboutTabContentProps) {
  const { decimals: outputTokenDecimals, data: outputTokenData } = useTokenInfo(id)
  const [about, setAbout] = useState<AboutProps>(defaultAbout)

  const circulatingSupply = 200000000
  const totalSupply = 1000000000
  const percentage = ((circulatingSupply / totalSupply) * 100).toFixed(2)

  useEffect(() => {
    if (outputTokenDecimals && outputTokenData) {
      setAbout({
        description: outputTokenData.result.content.metadata.description,
        decimals: outputTokenDecimals,
        tokenProgram: isFungibleToken(outputTokenData) ? outputTokenData.result.token_info.token_program : "NONE"
      })
    }
  }, [outputTokenDecimals, outputTokenData])

  return (
    <div>
      <div className="pb-4 flex justify-between">
        <div className={`${overview && (overview.extensions.website || overview.extensions.twitter) ? "w-1/2" : "w-full"}`}>
          <p>
            {about.description}
          </p>
        </div>
        {
          overview && (overview.extensions.website || overview.extensions.twitter) && (
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
          )
        }
      </div>
      <div className="space-y-2">
        <p>Market Info</p>
        <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-between">
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
            <p>{overview ? overview.numberMarkets : "None"}</p>
            <p>{`${formatNumber(overview ? overview.circulatingSupply : 0)} (${percentage}%)`}</p>
            <p>{overview ? overview.supply : "None"}</p>
          </div>
        </div>
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
