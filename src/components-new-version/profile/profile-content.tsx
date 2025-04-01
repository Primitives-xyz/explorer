'use client'

import { usePortfolioData } from '@/components-new-version/profile/hooks/use-portfolio-data'
import { ProfileHeader } from '@/components-new-version/profile/profile-header'
import { useProfileInfo } from '@/components-new-version/tapestry/hooks/use-profile-info'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { formatNumber } from '@/components-new-version/utils/utils'

interface Props {
  id: string
  walletAddress?: string
}

export function ProfileContent({ id, walletAddress }: Props) {
  const { mainUsername } = useCurrentWallet()

  const { profileInfo } = useProfileInfo({
    username: id,
    mainUsername,
    walletAddress,
  })

  console.log(profileInfo)

  const { portfolioData, isLoading: isPortfolioLoading } = usePortfolioData({
    walletAddress: profileInfo?.wallet?.address,
  })

  const { items = [], totalUsd = 0 } = portfolioData?.data || {}

  const solToken = items.find((item) => item.symbol === 'SOL')
  const solValue = solToken?.valueUsd ?? 0
  const solBalance = solToken?.uiAmount ?? 0

  const formattedSolBalance = solBalance.toFixed(3).replace(/\.?0+$/, '')

  return (
    <div className="flex flex-col w-full space-y-6">
      <ProfileHeader
        profileInfo={profileInfo}
        mainUsername={mainUsername}
        username={id}
      />
      <div className="flex w-full justify-between gap-4">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Connected Wallets</CardTitle>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <SmallCard
                  label="Net Worth"
                  value={`$${formatNumber(totalUsd)}`}
                />
                <SmallCard label="PNL/Trade" />
                <SmallCard label="Vol" />
                <SmallCard label="W/L" />
              </div>
            </CardContent>
          </CardHeader>
        </Card>
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Social</CardTitle>
            <CardContent></CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

function SmallCard({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-secondary/20 rounded-md p-2 flex flex-col space-y-2 ">
      <span className="text-secondary">{label}</span>
      <span>{value}</span>
    </div>
  )
}
