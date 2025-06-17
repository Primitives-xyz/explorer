import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { CondensedStatusBar } from '@/components/status-bar/condensed/condensed'
import { DefaultStatusBar } from '@/components/status-bar/default'
import { useGetBalance } from '@/components/tapestry/hooks/use-get-balance'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface Props {
  condensed?: boolean
}

export interface StatusBarData {
  username?: string
  image?: string
  solidScore: string
  allTimeSavings: string
  balance: string
  auraPoints: string
}

export function StatusBar({ condensed }: Props) {
  const { mainProfile, walletAddress } = useCurrentWallet()

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
    allTimeSavings: '$6.23M',
    auraPoints: '2.345',
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
