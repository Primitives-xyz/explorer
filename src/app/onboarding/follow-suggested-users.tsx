'use client'

import { useWallet } from '@/components/auth/wallet-context'
import { useSuggested } from '@/components/get-suggested/hooks/use-suggested'
import { useLeaderboard } from '@/components/leaderboards/hooks/use-leaderboard'
import { FollowButton } from '@/components/profile/follow-button'
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
import { useEffect } from 'react'

function GenericUsers() {
  const t = useTranslations()
  const { walletAddress } = useWallet()

  const genericUsers = [
    {
      address: 'H5H1aCXpCYdeFyhWuATJaaV1R24Zdj1ZgWfFLgehxPYJ',
      trade_count: 150,
      profile: {
        username: 'hello',
        image: null,
        bio: 'Active trader',
      },
    },
    {
      address: 'deej',
      trade_count: 120,
      profile: {
        username: 'deej',
        image: null,
        bio: 'Experienced trader',
      },
    },
  ]

  const { getSuggested, profiles, loading, error } = useSuggested()

  useEffect(() => {
    if (walletAddress) {
      getSuggested(walletAddress)
    }
  }, [walletAddress, getSuggested])

  const hasProfiles = profiles && Object.keys(profiles).length > 0

  return (
    <DataCard
      className="border-none bg-transparent"
      loading={loading}
      error={error}
    >
      <div className="h-full flex flex-col relative">
        <Table>
          <TableHeader>
            <TableRow className="border-violet-500/20 hover:bg-transparent">
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Trader</TableHead>
              <TableHead className="text-right">
                {hasProfiles ? 'You know them from' : 'Trades'}
              </TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="relative">
            {hasProfiles
              ? Object.entries(profiles).map(([key, trader], index) => (
                  <TableRow
                    key={`${trader.wallet.address}-${index}`}
                    className="border-violet-500/20 hover:bg-violet-500/5"
                  >
                    <TableCell className="font-medium">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/20 ring-1 ring-violet-500/30">
                        <span className="text-violet-300 text-sm">
                          {index + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {trader?.profile?.image && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden">
                            <Image
                              src={trader?.profile?.image}
                              alt={trader?.profile?.username || 'Trader'}
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <Link
                            href={`/${trader?.profile?.username || ''}`}
                            className="text-violet-300 text-sm hover:text-violet-200 transition-colors"
                          >
                            {trader?.profile?.username || 'Anonymous Trader'}
                          </Link>
                          {trader?.wallet?.address && (
                            <span className="text-xs text-violet-300/70 line-clamp-1">
                              {`${trader?.wallet?.address?.slice(
                                0,
                                4
                              )}...${trader?.wallet?.address?.slice(-4)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-violet-300">
                      {trader?.namespaces?.[0]?.readableName || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <FollowButton
                        username={trader?.profile?.username || ''}
                        size="sm"
                      />
                    </TableCell>
                  </TableRow>
                ))
              : genericUsers.map((trader, index) => (
                  <TableRow
                    key={`${trader.address}-${index}`}
                    className="border-violet-500/20 hover:bg-violet-500/5"
                  >
                    <TableCell className="font-medium">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/20 ring-1 ring-violet-500/30">
                        <span className="text-violet-300 text-sm">
                          {index + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {trader.profile?.image && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden">
                            <Image
                              src={trader.profile.image}
                              alt={trader.profile?.username || 'Trader'}
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <Link
                            href={`/${trader.profile?.username || ''}`}
                            className="text-violet-300 text-sm hover:text-violet-200 transition-colors"
                          >
                            {trader.profile?.username || 'Anonymous Trader'}
                          </Link>
                          {trader.profile?.bio && (
                            <span className="text-xs text-violet-300/70 line-clamp-1">
                              {trader.profile.bio}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-violet-300">
                      {Math.round(trader.trade_count)}
                    </TableCell>
                    <TableCell>
                      <FollowButton
                        username={trader.profile?.username || ''}
                        size="sm"
                      />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </DataCard>
  )
}

function TopTradersSection() {
  const { traders, isLoading, error } = useLeaderboard()
  const t = useTranslations()

  return (
    <DataCard
      className="border-none bg-transparent"
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
            {traders.slice(0, 5).map((trader, index) => (
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
                      {trader.profile.bio && (
                        <span className="text-xs text-violet-300/70 line-clamp-1">
                          {trader.profile.bio}
                        </span>
                      )}
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

export function FollowSuggestedUsers() {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-semibold text-violet-100 mb-4">
          Suggested Users
        </h2>
        <GenericUsers />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-violet-100 mb-4">
          Top Traders
        </h2>
        <TopTradersSection />
      </div>
    </div>
  )
}
