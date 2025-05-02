'use client'

import { INamespaceProfile } from '@/components/tapestry/models/namespace.models'
import { Button, ButtonVariant } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { DataTable } from '@/components/ui/table/data-table'
import { SortableHeader } from '@/components/ui/table/sortable-header'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'
import { abbreviateWalletAddress } from '@/utils/utils'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { useState } from 'react'

interface Props {
  profiles: INamespaceProfile[] | null
}

export function NamespaceProfiles({ profiles }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'followers', desc: true },
  ])

  const columns: ColumnDef<INamespaceProfile>[] = [
    {
      id: 'profile',
      header: 'Namespace profiles',
      enableSorting: false,
      cell: ({ row }) => {
        const elem = row.original

        return (
          <div className="flex items-center gap-4">
            <Avatar size={32} username={elem.profile.username} />
            <div className="flex flex-col items-start w-2/3">
              <Button
                variant={ButtonVariant.GHOST}
                href={
                  elem.namespace.name === EXPLORER_NAMESPACE
                    ? route('entity', { id: elem.profile.username })
                    : route('namespaceProfile', {
                        id: elem.namespace.name,
                        profile: elem.profile.id,
                      })
                }
                className="flex flex-col h-auto items-start"
              >
                <p className="truncate text-foreground">
                  @{elem.profile.username}
                </p>
                <p>
                  {abbreviateWalletAddress({ address: elem.wallet.address })}
                </p>
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'socialCounts.followers',
      header: ({ column }) => (
        <SortableHeader label="Followers" column={column} />
      ),
      enableSorting: true,
      cell: ({ getValue }) => <div>{getValue<number>()}</div>,
    },
    {
      accessorKey: 'socialCounts.following',
      header: ({ column }) => (
        <SortableHeader label="Followings" column={column} />
      ),
      enableSorting: true,
      cell: ({ getValue }) => <div>{getValue<number>()}</div>,
    },
  ]

  return (
    <div>
      <DataTable
        data={profiles ?? []}
        columns={columns}
        loading={false}
        sorting={sorting}
        onSortingChange={setSorting}
        tableClassName="max-h-[calc(100vh-220px)]"
        isSmall
      />
    </div>
  )
}
