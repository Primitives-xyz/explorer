'use client'

import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { CondensedStatusBar } from '@/components/status-bar/condensed/condensed'
import { DefaultStatusBar } from '@/components/status-bar/default'
import { useGetBalance } from '@/components/tapestry/hooks/use-get-balance'
import { useWalletPnL } from '@/components/trenches/simple-inventory-modal'
import { useSSESavings } from '@/hooks/use-sse-savings'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface Props {
  condensed?: boolean
}

export interface StatusBarData {
  username?: string
  image?: string
  solidScore: string
  allTimeSavings: number
  balance: string
  walletPnL: number
  walletPnLLoading: boolean
  sseSavingsLoading: boolean
  solidScoreLoading: boolean
  balanceLoading: boolean
}

export function StatusBar({ condensed }: Props) {
  const { mainProfile, walletAddress } = useCurrentWallet()
  const { data: walletPnL, loading: walletPnLLoading } = useWalletPnL(
    walletAddress,
    true
  )
  const { data: sseSavings, loading: sseSavingsLoading } = useSSESavings(
    walletAddress
  )
  const { data, loading: solidScoreLoading } = useSolidScore({
    profileId: mainProfile?.id,
  })
  const { balance, loading: balanceLoading } = useGetBalance({ walletAddress })

  const statusBarData: StatusBarData = {
    username: mainProfile?.username,
    image: mainProfile?.image || '',
    solidScore: data?.score
      ? formatSmartNumber(data.score, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : '0',
    balance: balance || '0',
    allTimeSavings: sseSavings?.totalSavingsUSD || 0,
    walletPnL: walletPnL?.realizedPnLUSD || 0,
    walletPnLLoading,
    sseSavingsLoading,
    solidScoreLoading,
    balanceLoading,
  }

  if (
    !mainProfile?.userRevealedTheSolidScore &&
    !mainProfile?.userHasClickedOnShareHisSolidScore
  )
    return null

  if (condensed) {
    return <CondensedStatusBar data={statusBarData} />
  } else return <DefaultStatusBar data={statusBarData} />
}
