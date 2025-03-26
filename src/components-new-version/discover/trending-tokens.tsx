'use client'

import { DataTable } from '@/components-new-version/common/table/data-table'
import { useTrendingTokens } from '@/components-new-version/discover/hooks/use-trending-tokens'
import { ITrendingToken } from '@/components-new-version/models/token.models'
import { Button, ButtonVariant } from '@/components-new-version/ui'
import { route } from '@/components-new-version/utils/route'
import { cn, formatNumber } from '@/components-new-version/utils/utils'
import { Column, ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Image from 'next/image'

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

export function TrendingTokens() {
  const { tokens, loading } = useTrendingTokens()

  const columns: ColumnDef<ITrendingToken>[] = [
    {
      id: 'name',
      header: 'Token',
      enableSorting: false,
      accessorFn: (row) => row.name,
      cell: ({ row }) => {
        return (
          <span className="flex items-center gap-2">
            <div className="relative mr-2">
              {row.original.logoURI && (
                <Image
                  src={row.original.logoURI}
                  alt={row.original.symbol}
                  width={32}
                  height={32}
                  className="rounded-full object-cover aspect-square"
                />
              )}
              <div
                className={cn(
                  '-top-2 -right-2 bg-secondary rounded-full aspect-square absolute w-5 h-5 flex items-center justify-center text-[8px] font-bold border border-secondary',
                  {
                    'bg-secondary text-background': row.index <= 2,
                    'bg-transparent text-secondary backdrop-blur-xl':
                      row.index > 2,
                  }
                )}
              >
                #{row.index + 1}
              </div>
            </div>
            <Button
              variant={ButtonVariant.GHOST}
              className="hover:bg-transparent"
              href={route('address', { id: row.original.address })}
            >
              <p className="font-bold">{row.original.name}</p>
            </Button>
            <p className="font-thin">${row.original.symbol}</p>
          </span>
        )
      },
    },
    {
      accessorKey: 'price',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Price" column={column} />,
      cell: ({ getValue }) => (
        <span>${formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: 'volume24hUSD',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Vol" column={column} />,
      cell: ({ getValue }) => (
        <span>${formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: 'liquidity',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label="Liquidity" column={column} />
      ),
      cell: ({ getValue }) => (
        <span>${formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: 'holders',
      header: '',
      enableSorting: false,
      cell: ({ getValue }) => {
        return (
          <span>
            <Button disabled>BUY</Button>
          </span>
        )
      },
    },
  ]

  return (
    <DataTable
      data={tokens}
      columns={columns}
      withPagination
      isLoading={loading}
    />
  )
}
