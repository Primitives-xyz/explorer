'use client'

import { DataTable } from '@/components-new-version/discover/data-table'
import {
  TimeFrame,
  useTopTraders,
} from '@/components-new-version/discover/hooks/use-top-traders'
import { ITopTraders } from '@/components-new-version/models/token.models'
import {
  abbreviateWalletAddress,
  formatNumber,
} from '@/components-new-version/utils/utils'
import { Column, ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'

interface SortableHeaderProps {
  label: string
  column: Column<any, unknown>
}

function SortableHeader({ label, column }: SortableHeaderProps) {
  const isSorted = column.getIsSorted()

  return (
    <div
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      {isSorted === 'asc' && <ArrowUp size={14} />}
      {isSorted === 'desc' && <ArrowDown size={14} />}
    </div>
  )
}

interface Props {
  timeFrame: TimeFrame
}

export function TopTraders({ timeFrame }: Props) {
  const { traders } = useTopTraders({ timeFrame })

  const columns: ColumnDef<ITopTraders>[] = [
    {
      id: 'trade_count',
      header: 'Trader',
      enableSorting: false,
      cell: ({ row }) => {
        const traders = row.original

        return (
          <span className="flex items-center gap-2">
            <div className="relative mr-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-background">
              <p className="text-xs">#{row.index + 1}</p>
            </div>
            <p className="font-bold">
              {abbreviateWalletAddress({ address: traders.address })}
            </p>
          </span>
        )
      },
    },
    {
      accessorKey: 'pnl',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="PNL" column={column} />,
      cell: ({ getValue }) => {
        return (
          <span>
            {(getValue() as number) >= 0 ? '▲' : '▼'} $
            {formatNumber(Math.abs(getValue() as number))}
          </span>
        )
      },
    },
    {
      accessorKey: 'pnl-trade',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label="PNL/Trade" column={column} />
      ),
      cell: ({ row }) => {
        const trader = row.original

        const pnlPerTrade =
          trader.trade_count > 0 ? trader.pnl / trader.trade_count : trader.pnl

        return (
          <span>
            {trader.trade_count > 0
              ? `$${formatNumber(Math.abs(pnlPerTrade))}`
              : trader.pnl !== 0
              ? 'Unrealized'
              : 'No trades'}
          </span>
        )
      },
    },
    {
      accessorKey: 'volume',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Volume" column={column} />,
      cell: ({ getValue, row }) => {
        return (
          <span>
            {(getValue() as number) > 0
              ? `$${formatNumber(getValue() as number)}`
              : row.original.pnl !== 0
              ? 'Holding'
              : 'No volume'}
          </span>
        )
      },
    },
    {
      accessorKey: 'trade_count',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Trades" column={column} />,
      cell: ({ getValue, row }) => {
        return (
          <span>
            {(getValue() as number) > 0
              ? formatNumber(getValue() as number)
              : row.original.pnl !== 0
              ? 'Holding'
              : '0'}
          </span>
        )
      },
    },
  ]

  return <DataTable data={traders} columns={columns} />
}
