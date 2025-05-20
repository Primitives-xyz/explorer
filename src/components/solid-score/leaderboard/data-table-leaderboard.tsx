'use client'

import { SolidScoreLeaderboardResponse } from '@/components/tapestry/models/solid.score.models'
import { Button, ButtonVariant } from '@/components/ui'
import { DataTable } from '@/components/ui/table/data-table'
import { SortableHeader } from '@/components/ui/table/sortable-header'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { route } from '@/utils/route'
import { cn } from '@/utils/utils'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { useState } from 'react'

const baseColumnStyles = {
  rank: 'md:w-[100px]',
  username: 'flex-1 md:min-w-[200px]',
  score: 'md:w-[150px]',
  percentile: 'md:w-[150px]',
}

interface DataTableLeaderboardProps {
  data: SolidScoreLeaderboardResponse[]
  loading: boolean
  currentUsername?: string
}

export function DataTableLeaderboard({
  data,
  loading,
  currentUsername,
}: DataTableLeaderboardProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'position', desc: false },
  ])

  const columns: ColumnDef<SolidScoreLeaderboardResponse>[] = [
    {
      accessorKey: 'position',
      enableSorting: true,
      header: ({ column }) => (
        <div className={baseColumnStyles.rank}>
          <SortableHeader label="Rank" column={column} />
        </div>
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<number>()
        const isCurrentUser = row.original.username === currentUsername
        return (
          <div
            className={cn(baseColumnStyles.rank, {
              'text-primary font-bold': isCurrentUser,
            })}
          >
            #{value}
          </div>
        )
      },
    },
    {
      accessorKey: 'username',
      enableSorting: true,
      header: ({ column }) => (
        <div className={baseColumnStyles.username}>
          <SortableHeader label="Username" column={column} />
        </div>
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<string>()
        const isCurrentUser = row.original.username === currentUsername
        return (
          <div className={baseColumnStyles.username}>
            <Button
              variant={ButtonVariant.LINK}
              href={route('entity', { id: value })}
              className={cn('p-0 h-auto', {
                'text-primary font-bold': isCurrentUser,
              })}
            >
              {value}
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'score',
      enableSorting: true,
      header: ({ column }) => (
        <div className={baseColumnStyles.score}>
          <SortableHeader label="Score" column={column} />
        </div>
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<number>()
        const isCurrentUser = row.original.username === currentUsername
        return (
          <div
            className={cn(baseColumnStyles.score, {
              'text-primary font-bold': isCurrentUser,
            })}
          >
            {formatSmartNumber(value || 1, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'percentile',
      enableSorting: true,
      header: ({ column }) => (
        <div className={baseColumnStyles.percentile}>
          <SortableHeader label="Percentile" column={column} />
        </div>
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<number>()
        const isCurrentUser = row.original.username === currentUsername
        return (
          <div
            className={cn(baseColumnStyles.percentile, {
              'text-primary font-bold': isCurrentUser,
            })}
          >
            {formatSmartNumber(value || 0, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            %
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      tableClassName="h-[600px]"
      sorting={sorting}
      isSmall
      onSortingChange={setSorting}
    />
  )
}
