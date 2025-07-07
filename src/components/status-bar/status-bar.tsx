'use client'

import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { CondensedStatusBar } from '@/components/status-bar/condensed/condensed'
import { DefaultStatusBar } from '@/components/status-bar/default'
import { useGetBalance } from '@/components/tapestry/hooks/use-get-balance'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useWalletPnL } from '@/components/trenches/simple-inventory-modal'
import { useEffect } from 'react'
import { useSSESavings } from '@/hooks/use-sse-savings'

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
}

export function StatusBar({ condensed }: Props) {
  const { mainProfile, walletAddress } = useCurrentWallet()
  const { data: walletPnL } = useWalletPnL(walletAddress, true)
  const { data: sseSavings } = useSSESavings(walletAddress)

  const { data } = useSolidScore({ profileId: mainProfile?.id })

  const { balance } = useGetBalance({ walletAddress })

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
  }

  useEffect(() => {
    console.log('walletPnL', walletPnL)
  }, [walletPnL])

  if (
    !mainProfile?.userRevealedTheSolidScore &&
    !mainProfile?.userHasClickedOnShareHisSolidScore
  )
    return null

  if (condensed) {
    return <CondensedStatusBar data={statusBarData} />
  } else return <DefaultStatusBar data={statusBarData} />
}
