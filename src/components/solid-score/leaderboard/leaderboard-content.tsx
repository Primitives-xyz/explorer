'use client'

import { useSolidScoreLeaderboard } from '@/components/solid-score/hooks/use-solid-score-leaderboard'
import { SolidScoreLeaderboardResponse } from '@/components/tapestry/models/solid.score.models'
import { Button, ButtonVariant } from '@/components/ui'
import { DataTable } from '@/components/ui/table/data-table'
import { SortableHeader } from '@/components/ui/table/sortable-header'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { useState } from 'react'

export function LeaderboardContent() {
  const { data, loading } = useSolidScoreLeaderboard()
  const { mainProfile } = useCurrentWallet()

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'position', desc: false },
  ])

  const mockUserPosition = {
    position: 789,
    username: mainProfile?.username ?? '',
    score: 150,
  }

  const columns: ColumnDef<SolidScoreLeaderboardResponse>[] = [
    {
      accessorKey: 'position',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Rank" column={column} />,
      cell: ({ getValue, row }) => {
        const value = getValue<number>()
        const isCurrentUser = row.original.username === mainProfile?.username
        return (
          <div className={cn({ 'text-primary font-bold': isCurrentUser })}>
            #{value}
          </div>
        )
      },
    },
    {
      accessorKey: 'username',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label="Username" column={column} />
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<string>()
        const isCurrentUser = row.original.username === mainProfile?.username
        return (
          <Button
            variant={ButtonVariant.LINK}
            href={route('entity', { id: value })}
            className={cn('p-0 h-auto', {
              'text-primary font-bold': isCurrentUser,
            })}
          >
            {value}
          </Button>
        )
      },
    },
    {
      accessorKey: 'score',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Score" column={column} />,
      cell: ({ getValue, row }) => {
        const value = getValue<number>()
        const isCurrentUser = row.original.username === mainProfile?.username
        return (
          <div className={cn({ 'text-primary font-bold': isCurrentUser })}>
            {formatSmartNumber(value || 1, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
        )
      },
    },
  ]

  const isUserInTopList = data?.some(
    (item) => item.username === mainProfile?.username
  )
  return (
    <>
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="space-y-4">
        <DataTable
          data={data ?? []}
          columns={columns}
          loading={loading}
          tableClassName="h-[600px]"
          isSmall
          sorting={sorting}
          onSortingChange={setSorting}
        />
        {mainProfile && !isUserInTopList && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg">
              <div className="text-muted-foreground">
                #{mockUserPosition.position}
              </div>
              <Button
                variant={ButtonVariant.LINK}
                href={route('entity', { id: mockUserPosition.username })}
                className="text-primary font-bold p-0 h-auto"
              >
                {mockUserPosition.username}
              </Button>
              <div className="text-muted-foreground">
                {formatSmartNumber(mockUserPosition.score || 1, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
