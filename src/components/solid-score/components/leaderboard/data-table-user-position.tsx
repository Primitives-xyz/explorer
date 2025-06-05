'use client'

import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { Button, ButtonVariant } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { DataTable } from '@/components/ui/table/data-table'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

const baseColumnStyles = {
  rank: 'md:w-[100px]',
  username: 'flex-1 md:min-w-[200px]',
  score: 'md:w-[150px]',
  percentile: 'md:w-[150px]',
}

interface UserPosition {
  position?: number
  username: string
  score?: number
  percentile?: number
  image?: string
}

export function DataTableUserPosition() {
  const { mainProfile } = useCurrentWallet()
  const { data: solidScoreUserData } = useSolidScore({
    profileId: mainProfile?.id,
  })
  const t = useTranslations('menu.solid_score.leaderboard.table')

  const userPosition = {
    position: solidScoreUserData?.position,
    username: mainProfile?.username ?? '',
    score: solidScoreUserData?.score,
    percentile: solidScoreUserData?.percentile || 0,
    image: solidScoreUserData?.image,
  }

  const columns: ColumnDef<UserPosition>[] = [
    {
      accessorKey: 'position',
      header: () => (
        <div className={baseColumnStyles.rank}>{t('columns.rank')}</div>
      ),
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return (
          <div className={cn(baseColumnStyles.rank, 'text-muted-foreground')}>
            {t('position_prefix')}
            {value}
          </div>
        )
      },
    },
    {
      accessorKey: 'username',
      header: () => (
        <div className={baseColumnStyles.username}>{t('columns.username')}</div>
      ),
      cell: ({ getValue, row }) => {
        const value = getValue<string>()

        return (
          <div className={baseColumnStyles.username}>
            <Button
              variant={ButtonVariant.LINK}
              href={route('entity', { id: value })}
              className="p-0 h-auto max-w-[100px] md:max-w-[200px] text-primary font-bold"
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
      header: () => (
        <div className={baseColumnStyles.score}>{t('columns.score')}</div>
      ),
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return (
          <div className={cn(baseColumnStyles.score, 'text-muted-foreground')}>
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
      header: () => (
        <div className={baseColumnStyles.percentile}>
          {t('columns.percentile')}
        </div>
      ),
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return (
          <div
            className={cn(baseColumnStyles.percentile, 'text-muted-foreground')}
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
    <div className="pt-4">
      <DataTable
        data={[userPosition]}
        columns={columns}
        isSmall
        tableClassName="bg-muted rounded-lg"
      />
    </div>
  )
}
