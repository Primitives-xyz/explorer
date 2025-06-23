'use client'

import { ISolidScoreLeaderboardResponse } from '@/components/tapestry/models/solid.score.models'
import { Button, ButtonVariant, Spinner } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { DataTable } from '@/components/ui/table/data-table'
import { SortableHeader } from '@/components/ui/table/sortable-header'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { route } from '@/utils/route'
import { cn } from '@/utils/utils'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

const baseColumnStyles = {
  rank: 'md:w-[100px]',
  username: 'flex-1 md:min-w-[200px]',
  score: 'md:w-[150px]',
  percentile: 'md:w-[150px]',
}

interface Props {
  data: ISolidScoreLeaderboardResponse[]
  loading: boolean
  currentUsername?: string
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

export function DataTableLeaderboard({
  data,
  loading,
  currentUsername,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: Props) {
  const t = useTranslations('menu.solid_score.leaderboard.table')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'position', desc: false },
  ])

  const containerRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef<boolean>(false)

  const handleScroll = useCallback(() => {
    if (
      !containerRef.current ||
      !hasMore ||
      loadingMore ||
      isLoadingRef.current
    ) {
      return
    }

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    const threshold = 100
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold

    if (isNearBottom) {
      isLoadingRef.current = true
      onLoadMore?.()
    }
  }, [hasMore, loadingMore, onLoadMore])

  useEffect(() => {
    if (!loadingMore) {
      isLoadingRef.current = false
    }
  }, [loadingMore])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const columns: ColumnDef<ISolidScoreLeaderboardResponse>[] = [
    {
      accessorKey: 'position',
      enableSorting: true,
      header: ({ column }) => (
        <div className={baseColumnStyles.rank}>
          <SortableHeader label={t('columns.rank')} column={column} />
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
            {t('position_prefix')}
            {value}
          </div>
        )
      },
    },
    {
      accessorKey: 'username',
      enableSorting: true,
      header: ({ column }) => (
        <div className={baseColumnStyles.username}>
          <SortableHeader label={t('columns.username')} column={column} />
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
              className={cn('p-0 h-auto max-w-[100px] md:max-w-[200px]', {
                'text-primary font-bold': isCurrentUser,
              })}
            >
              <Avatar
                imageUrl={row.original.image}
                username={value}
                size={24}
                className="w-6 h-6"
              />
              <p className="truncate">{value}</p>
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
          <SortableHeader label={t('columns.score')} column={column} />
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
          <SortableHeader label={t('columns.percentile')} column={column} />
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
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: '500px' }}
      >
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          sorting={sorting}
          isSmall
          onSortingChange={setSorting}
        />
      </div>

      {loadingMore && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
    </div>
  )
}
