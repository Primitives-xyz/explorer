'use client'

import { DataTable } from '@/components-new-version/ui/table/data-table'
import { formatNumber } from '@/components-new-version/utils/utils'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { SortableHeader } from '../../ui/table/sortable-header'
import { useGetWalletTokens } from '../hooks/use-get-wallet-tokens'
import { IFungibleToken } from '../profile.models'

interface Props {
  walletAddress: string
}

export function ProfileTokens({ walletAddress }: Props) {
  const { fungibleTokens, isLoading } = useGetWalletTokens({
    walletAddress,
  })

  const columns: ColumnDef<IFungibleToken>[] = [
    {
      id: 'name',
      header: 'Token',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 aspect-square rounded-full bg-muted overflow-hidden">
              {row.original.imageUrl &&
                !row.original.imageUrl.includes('ipfs://') && (
                  <Image
                    src={row.original.imageUrl}
                    alt={row.original.symbol}
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                )}
            </div>
            <h4>{row.original.name}</h4>
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
      accessorKey: 'price',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Price" column={column} />,
      cell: ({ getValue }) => {
        const value = getValue<number>()

        return <div>${formatNumber(value)}</div>
      },
    },
  ]

  return (
    <DataTable
      data={fungibleTokens}
      columns={columns}
      isLoading={isLoading}
      // withPagination
      isSmall
    />
  )
}
