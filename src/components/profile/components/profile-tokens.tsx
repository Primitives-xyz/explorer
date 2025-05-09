'use client'

import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { DataTable } from '@/components/ui/table/data-table'
import { ValidatedImage } from '@/components/ui/validated-image/validated-image'
import { SOL_MINT } from '@/utils/constants'
import { route } from '@/utils/route'
import { formatNumber } from '@/utils/utils'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { useState } from 'react'
import { SortableHeader } from '../../ui/table/sortable-header'
import { IFungibleToken } from '../fungible-tokens.models'
import { useGetWalletTokens } from '../hooks/use-get-wallet-tokens'

interface Props {
  walletAddress: string
}

export function ProfileTokens({ walletAddress }: Props) {
  const { fungibleTokens, isLoading } = useGetWalletTokens({
    walletAddress,
  })

  const { setOpen, setInputs } = useSwapStore()

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalPrice', desc: true },
  ])

  const columns: ColumnDef<IFungibleToken>[] = [
    {
      id: 'name',
      header: 'Token',
      enableSorting: false,
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl?.trimStart()
        return (
          <div className="flex items-center gap-2">
            <Button
              variant={ButtonVariant.LINK}
              href={route('trade', {
                query: {
                  inputMint: SOL_MINT,
                  outputMint: row.original.id,
                },
              })}
            >
              <div className="w-6 aspect-square rounded-full bg-muted overflow-hidden shrink-0">
                {imageUrl && (
                  <ValidatedImage
                    src={imageUrl}
                    alt={row.original.symbol}
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>

              <h4 className="max-w-[5rem] truncate">{row.original.name}</h4>
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'balance',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label="Balance" column={column} />
      ),
      cell: ({ row, getValue }) => {
        const value = getValue<number>()
        const token = row.original

        return (
          <div>
            {formatNumber(value)} {token.symbol}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalPrice',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Value" column={column} />,
      cell: ({ getValue }) => {
        const value = getValue<number>()

        return <div>${formatNumber(value)}</div>
      },
    },
    {
      header: 'Buy',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <Button
              size={ButtonSize.SM}
              variant={ButtonVariant.OUTLINE}
              onClick={() => {
                setOpen(true)
                setInputs({
                  inputMint: SOL_MINT,
                  outputMint: row.original.mint,
                  inputAmount: 0.1,
                })
              }}
            >
              Buy
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm">Tokens</h3>
        <span className="text-muted-foreground text-xs">
          ( {fungibleTokens?.length ?? 0} )
        </span>
      </div>
      <DataTable
        data={fungibleTokens}
        columns={columns}
        loading={isLoading}
        tableClassName="h-[300px]"
        isSmall
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  )
}

//Agi25qJyTe2dPNcGavDs53h1dSxsV5LPBzuqY6kKFx5T
