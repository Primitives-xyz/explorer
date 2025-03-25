'use client'

import { DataTable } from '@/components-new-version/common/table/data-table'
import { ColumnDef } from '@tanstack/react-table'

interface Props {
  username: string
}

export function RightSideDiscover() {
  const mockTopTraders = [
    {
      username: 'solana',
    },
    {
      username: 'solana',
    },
    {
      username: 'solana',
    },
  ]

  const columns: ColumnDef<Props>[] = [
    {
      id: 'username',
      header: 'Trader',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <span className="flex items-center gap-2">
            {row.original.username}
            {/* <WalletAddressButton walletAddress={traders.address} /> */}
          </span>
        )
      },
    },
  ]

  return (
    <div className="pt-[100px] space-y-4 flex flex-col">
      <DataTable data={mockTopTraders} columns={columns} />
    </div>
  )
}
