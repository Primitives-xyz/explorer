'use client'

import { useGetProfilePortfolio } from '@/components/birdeye/hooks/use-get-profile-portfolio'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardVariant,
  Skeleton,
} from '@/components/ui'
import { formatNumber, mapEmpty } from '@/utils/utils'

interface Props {
  walletAddress: string
}

export function ProfileWalletInfo({ walletAddress }: Props) {
  const { data, loading } = useGetProfilePortfolio({
    walletAddress,
  })

  // const solToken = data?.data?.items.find((item) => item.symbol === 'SOL')
  // const solValue = solToken?.valueUsd ?? 0
  // const solBalance = solToken?.uiAmount ?? 0

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {mapEmpty(4, (index) => (
          <Skeleton key={index} className="h-[58px]" />
        ))}
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      <SmallCard
        label="Net Worth"
        value={`$${formatNumber(data.data.totalUsd)}`}
      />
      <SmallCard label="PNL/Trade" value="" />
      <SmallCard label="Vol" value="" />
      <SmallCard label="W/L" value="" />
    </div>
  )
}

function SmallCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant={CardVariant.ACCENT_SOCIAL} className="rounded-md">
      <CardHeader className="p-2 text-secondary">
        <CardTitle className="text-xs">{label}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 text-xs">{value}</CardContent>
    </Card>
  )
}
