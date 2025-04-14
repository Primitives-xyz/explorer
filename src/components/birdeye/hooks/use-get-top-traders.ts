import { useQuery } from '@/components/utils/api'
import { formatNumber } from '@/components/utils/utils'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import {
  ETimeFrame,
  IGetTopTradersResponse,
} from '../birdeye-top-traders.models'

interface Props {
  timeFrame: ETimeFrame
  limit?: number // 1 - 10
}

export function useGetTopTraders({ timeFrame, limit = 10 }: Props) {
  const t = useTranslations()
  const { data, loading, error } = useQuery<IGetTopTradersResponse>({
    endpoint: 'https://public-api.birdeye.so/trader/gainers-losers',
    queryParams: {
      type: timeFrame,
      sort_by: 'PnL',
      sort_type: 'desc',
      offset: 0,
      limit,
    },
    headers: {
      'x-chain': 'solana',
      'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY!,
    },
    toBackend: false,
  })

  const traders = useMemo(
    () =>
      data?.data?.items.map((item) => ({
        ...item,
        formattedPnl: `${item.pnl >= 0 ? '▲' : '▼'} ${formatNumber(
          Math.abs(item.pnl)
        )}`,
        formattedVolume: `${
          item.volume > 0
            ? `$${formatNumber(item.volume)}`
            : item.pnl !== 0
            ? 'Holding'
            : 'No volume'
        }`,
        formattedPnlPerTrade: `${
          item.trade_count > 0
            ? `$${formatNumber(
                Math.abs(
                  item.trade_count > 0 ? item.pnl / item.trade_count : item.pnl
                )
              )}`
            : item.pnl !== 0
            ? t('top_traders.unrealized')
            : t('top_traders.no_trades')
        }`,
        formattedTradeCount: `${
          item.trade_count > 0
            ? formatNumber(item.trade_count)
            : item.pnl !== 0
            ? 'Holding'
            : '0'
        }`,
      })) ?? [],
    [data, t]
  )

  return {
    traders,
    loading,
    error,
  }
}
