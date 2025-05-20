'use client'

import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { Button, ButtonVariant } from '@/components/ui'
import { DataTable } from '@/components/ui/table/data-table'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { ColumnDef } from '@tanstack/react-table'

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
}

export function DataTableUserPosition() {
  const { mainProfile } = useCurrentWallet()
  const { data: solidScoreUserData } = useSolidScore({ id: mainProfile?.id })

  const userPosition = {
    position: solidScoreUserData?.position,
    username: mainProfile?.username ?? '',
    score: solidScoreUserData?.score,
    percentile: solidScoreUserData?.percentile || 0,
  }

  const columns: ColumnDef<UserPosition>[] = [
    {
      accessorKey: 'position',
      header: () => <div className={baseColumnStyles.rank}>Rank</div>,
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return (
          <div className={cn(baseColumnStyles.rank, 'text-muted-foreground')}>
            #{value}
          </div>
        )
      },
    },
    {
      accessorKey: 'username',
      header: () => <div className={baseColumnStyles.username}>Username</div>,
      cell: ({ getValue }) => {
        const value = getValue<string>()
        return (
          <div className={baseColumnStyles.username}>
            <Button
              variant={ButtonVariant.LINK}
              href={route('entity', { id: value })}
              className="text-primary font-bold p-0 h-auto"
            >
              {value}
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'score',
      header: () => <div className={baseColumnStyles.score}>Score</div>,
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
        <div className={baseColumnStyles.percentile}>Percentile</div>
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
    <div className="border-t pt-4">
      <DataTable
        data={[userPosition]}
        columns={columns}
        isSmall
        tableClassName="bg-muted rounded-lg"
      />
    </div>
  )
}
