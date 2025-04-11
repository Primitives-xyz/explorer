'use client'

import { Button, ButtonVariant } from '@/components-new-version/ui'
import { DataTable } from '@/components-new-version/ui/table/data-table'
import { route } from '@/components-new-version/utils/route'
import { cn, formatNumber } from '@/components-new-version/utils/utils'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { ITrendingToken } from '../birdeye/birdeye-tokens-trending.models'
import { useGetTrendingTokens } from '../birdeye/hooks/use-get-trending-tokens'
import { SortableHeader } from '../ui/table/sortable-header'

export function TrendingTokens() {
  const { tokens, loading } = useGetTrendingTokens()

  const columns: ColumnDef<ITrendingToken>[] = [
    {
      id: 'name',
      header: 'Token',
      enableSorting: false,
      accessorFn: (row) => row.name,
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 aspect-square rounded-full bg-muted overflow-hidden">
                {row.original.logoURI && (
                  <Image
                    src={row.original.logoURI}
                    alt={row.original.symbol}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
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
              href={route('entity', { id: row.original.address })}
            >
              <p className="font-bold">{row.original.name}</p>
            </Button>
            <p className="font-thin">${row.original.symbol}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Price" column={column} />,
      cell: ({ getValue }) => {
        const value = getValue<number>()

        return <div>${formatNumber(value)}</div>
      },
    },
    {
      accessorKey: 'volume24hUSD',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Vol" column={column} />,
      cell: ({ getValue }) => {
        const value = getValue<number>()

        return <div>${formatNumber(value)}</div>
      },
    },
    {
      accessorKey: 'liquidity',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label="Liquidity" column={column} />
      ),
      cell: ({ getValue }) => {
        const value = getValue<number>()

        return <div>${formatNumber(value)}</div>
      },
    },
    {
      accessorKey: 'holders',
      header: '',
      enableSorting: false,
      cell: ({ getValue }) => {
        return (
          <div>
            <Button disabled>BUY</Button>
          </div>
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
