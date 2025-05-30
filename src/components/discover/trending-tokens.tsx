'use client'

import { useGetTrendingTokens } from '@/components/birdeye/hooks/use-get-trending-tokens'
import { TokenHolders } from '@/components/common/token-holders'
import { ITrendingTokenWidthHolders } from '@/components/discover/models/trending-tokens.models'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { Button, ButtonVariant } from '@/components/ui'
import { DataTable } from '@/components/ui/table/data-table'
import { SortableHeader } from '@/components/ui/table/sortable-header'
import { ValidatedImage } from '@/components/ui/validated-image/validated-image'
import { SOL_MINT } from '@/utils/constants'
import { route } from '@/utils/route'
import { useIsMobile } from '@/utils/use-is-mobile'
import { cn, formatNumber } from '@/utils/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

export function TrendingTokens() {
  const { tokens, loading } = useGetTrendingTokens()
  //const { tokens, loading } = useGetTrendingTokensWithHolders()

  const { setOpen, setInputs } = useSwapStore()

  const { isMobile } = useIsMobile()

  const t = useTranslations('discover.trending_tokens')

  const baseColumns: ColumnDef<ITrendingTokenWidthHolders>[] = [
    {
      id: 'name',
      header: t('token'),
      enableSorting: false,
      accessorFn: (row) => row.name,
      cell: ({ row }) => {
        return (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 aspect-square rounded-full bg-muted overflow-hidden">
                  {row.original.logoURI && (
                    <ValidatedImage
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
                  {t('rank', { number: row.index + 1 })}
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
            {row.original.holders && (
              <TokenHolders data={row.original.holders} />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label={t('price')} column={column} />
      ),
      cell: ({ getValue }) => {
        const value = getValue<number>()

        return <div>${formatNumber(value)}</div>
      },
    },
    {
      accessorKey: 'volume24hUSD',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label={t('volume')} column={column} />
      ),
      cell: ({ getValue }) => {
        const value = getValue<number>()

        return <div>${formatNumber(value)}</div>
      },
    },
    {
      accessorKey: 'liquidity',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label={t('liquidity')} column={column} />
      ),
      cell: ({ getValue }) => {
        const value = getValue<number>()

        return <div>${formatNumber(value)}</div>
      },
    },
  ]

  const buyColumn: ColumnDef<ITrendingTokenWidthHolders> = {
    header: t('buy'),
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        variant={ButtonVariant.OUTLINE}
        onClick={() => {
          setOpen(true)
          setInputs({
            inputMint: SOL_MINT,
            outputMint: row.original.address,
            inputAmount: 0.1,
          })
        }}
      >
        {t('buy')}
      </Button>
    ),
  }

  const columns = isMobile ? baseColumns : [...baseColumns, buyColumn]

  return (
    <DataTable
      data={tokens}
      columns={columns}
      withPagination
      loading={loading}
    />
  )
}
