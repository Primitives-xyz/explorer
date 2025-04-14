'use client'

import { usePortfolioData } from '@/components/profile/hooks/use-portfolio-data'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardVariant,
} from '@/components/ui'
import { formatNumber } from '@/utils/utils'

interface Props {
  walletAddress?: string
}

export function ProfileInfo({ walletAddress }: Props) {
  const { portfolioData } = usePortfolioData({
    walletAddress: walletAddress || '',
  })

  const { items = [], totalUsd = 0 } = portfolioData?.data || {}

  //const solToken = items.find((item) => item.symbol === 'SOL')
  //const solValue = solToken?.valueUsd ?? 0
  //const solBalance = solToken?.uiAmount ?? 0

  //const formattedSolBalance = solBalance.toFixed(3).replace(/\.?0+$/, '')

  return (
    <div className="grid grid-cols-4 gap-4">
      <SmallCard label="Net Worth" value={`$${formatNumber(totalUsd)}`} />
      <SmallCard label="PNL/Trade" />
      <SmallCard label="Vol" />
      <SmallCard label="W/L" />
    </div>
  )
}

function SmallCard({ label, value }: { label: string; value?: string }) {
  return (
    <Card variant={CardVariant.ACCENT_SOCIAL} className="rounded-md">
      <CardHeader className="p-2 text-secondary">
        <CardTitle className="text-xs">{label}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 text-xs">{value}</CardContent>
    </Card>
  )
}
