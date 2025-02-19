'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table/table'
import { DataCard } from '@/components/ui/data-card'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FollowButton } from '../profile/follow-button'

interface Trader {
  address: string
  trade_count: number
  profile: {
    username: string
    image?: string
    bio?: string
  }
}

export function LeaderboardTable() {
  const [traders, setTraders] = useState<Trader[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations()

  useEffect(() => {
    const fetchTopTraders = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/leaderboard`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          console.error('API Response not OK:', {
            status: response.status,
            statusText: response.statusText,
          })
          throw new Error(
            `${t('error.failed_to_fetch_top_traders')} ${response.status}`
          )
        }

        const data = await response.json()
        console.log('API Response data:', data)

        if (!data.entries || !Array.isArray(data.entries)) {
          console.error('Invalid data format:', data)
          throw new Error('Invalid data format received from API')
        }

        const transformedTraders = data.entries.map((entry: any) => {
          console.log('Processing entry:', entry)
          return {
            address: entry.profile.wallet?.id || '',
            trade_count: entry.score || 0,
            profile: {
              username: entry.profile.username || 'Anonymous',
              image: entry.profile.image,
              bio: entry.profile.bio,
            },
          }
        })

        console.log('Transformed traders:', transformedTraders)
        setTraders(transformedTraders)
      } catch (err) {
        console.error(t('error.error_fetching_top_traders'), err)
        setError(
          err instanceof Error
            ? err.message
            : t('error.failed_to_fetch_traders')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopTraders()
  }, [])

  return (
    <DataCard
      className=" border-none bg-transparent"
      loading={isLoading}
      loadingText={t('top_traders.analyzing_trader_activity')}
      error={error}
    >
      <div className="h-full flex flex-col relative">
        <Table>
          <TableHeader>
            <TableRow className="border-violet-500/20 hover:bg-transparent">
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Trader</TableHead>
              <TableHead className="text-right">Trades</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="relative">
            {traders.map((trader, index) => (
              <TableRow
                key={`${trader.address}-${index}`}
                className="border-violet-500/20 hover:bg-violet-500/5"
              >
                <TableCell className="font-medium">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/20 ring-1 ring-violet-500/30">
                    <span className="text-violet-300 text-sm">{index + 1}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {trader.profile.image && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <Image
                          src={trader.profile.image}
                          alt={trader.profile.username || 'Trader'}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <Link
                        href={`/${trader.profile.username}`}
                        className="text-violet-300 text-sm hover:text-violet-200 transition-colors"
                      >
                        {trader.profile.username || 'Anonymous Trader'}
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-violet-300">
                  {Math.round(trader.trade_count)}
                </TableCell>
                <TableCell>
                  <FollowButton username={trader.profile.username} size="sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DataCard>
  )
}
