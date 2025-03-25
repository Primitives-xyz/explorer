'use client'

import { DataTable } from '@/components-new-version/discover/data-table'
import { useTrendingTokens } from '@/components-new-version/discover/hooks/use-trending-tokens'
import { ITrendingToken } from '@/components-new-version/models/token.models'
import { Button } from '@/components-new-version/ui'
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
  const { tokens } = useTrendingTokens()

  const columns: ColumnDef<ITrendingToken>[] = [
    {
      id: 'name',
      header: 'Token',
      enableSorting: false,
      accessorFn: (row) => row.name,
      cell: ({ row }) => {
        const token = row.original

        return (
          <span className="flex items-center gap-2">
            <div className="relative mr-2">
              {token.logoURI && (
                <Image
                  src={token.logoURI}
                  alt={token.symbol}
                  width={32}
                  height={32}
                  className="rounded-full object-cover aspect-square"
                />
              )}
              <div
                className={cn(
                  '-top-2 -right-2 bg-secondary rounded-full aspect-square absolute w-5 h-5 flex items-center justify-center text-[8px] font-bold border border-secondary',
                  {
                    'bg-secondary text-background': token.rank <= 3,
                    'bg-transparent text-secondary backdrop-blur-xl':
                      token.rank > 3,
                  }
                )}
              >
                #{token.rank}
              </div>
            </div>
            <p className="font-bold">{token.name}</p>
            <p className="font-thin">${token.symbol}</p>
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

  return <DataTable data={tokens} columns={columns} />
}
