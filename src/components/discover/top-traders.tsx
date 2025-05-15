'use client'

import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { DataTable } from '@/components/ui/table/data-table'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, cn, formatNumber } from '@/utils/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { ETimeFrame, ITopTrader } from '../birdeye/birdeye-top-traders.models'
import { useGetTopTraders } from '../birdeye/hooks/use-get-top-traders'
import { SortableHeader } from '../ui/table/sortable-header'

interface Props {
  timeFrame: ETimeFrame
}

export function TopTraders({ timeFrame }: Props) {
  const { traders, loading } = useGetTopTraders({
    timeFrame,
  })
  const t = useTranslations('discover.top_traders')

  const columns: ColumnDef<ITopTrader>[] = [
    {
      id: 'trader',
      header: t('trader'),
      enableSorting: false,
      cell: ({ row }) => {
        const traders = row.original

        return (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'relative mr-2 w-8 h-8 rounded-full flex items-center justify-center font-bold border border-secondary',
                {
                  'bg-secondary text-background': row.index <= 2,
                  'bg-transparent text-secondary': row.index > 2,
                }
              )}
            >
              <p className="text-xs">{t('rank', { number: row.index + 1 })}</p>
            </div>
            <Button
              href={route('entity', { id: traders.address })}
              variant={ButtonVariant.BADGE}
              size={ButtonSize.SM}
            >
              {abbreviateWalletAddress({
                address: traders.address,
              })}
            </Button>
          </div>
        )
      },
    },
    {
      id: 'pnl',
      accessorKey: 'pnl',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label={t('pnl')} column={column} />
      ),
      cell: ({ getValue }) => {
        const value = getValue<number>()

        return (
          <div>
            {value >= 0 ? '▲' : '▼'} ${formatNumber(Math.abs(value))}
          </div>
        )
      },
    },
    {
      id: 'pnl_trade',
      accessorKey: 'pnl-trade',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label={t('pnl_trade')} column={column} />
      ),
      cell: ({ row }) => {
        const trader = row.original

        const pnlPerTrade =
          trader.trade_count > 0 ? trader.pnl / trader.trade_count : trader.pnl

        return (
          <div>
            {trader.trade_count > 0
              ? `$${formatNumber(Math.abs(pnlPerTrade))}`
              : trader.pnl !== 0
              ? t('unrealized')
              : t('no_trades')}
          </div>
        )
      },
    },
    {
      id: 'volume',
      accessorKey: 'volume',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label={t('volume')} column={column} />
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<number>()

        return (
          <div>
            {value > 0
              ? `$${formatNumber(value)}`
              : row.original.pnl !== 0
              ? t('holding')
              : t('no_volume')}
          </div>
        )
      },
    },
    {
      id: 'trade_count',
      accessorKey: 'trade_count',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label={t('trades')} column={column} />
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<number>()

        return (
          <div>
            {value > 0
              ? formatNumber(value)
              : row.original.pnl !== 0
              ? t('holding')
              : '0'}
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      data={traders}
      columns={columns}
      withPagination
      loading={loading}
    />
  )
}
