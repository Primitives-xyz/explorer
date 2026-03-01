'use client'

import { Button, ButtonVariant } from '@/components/ui/button'
import { Skeleton } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  ArrowRightLeft,
  Globe,
  Search,
  Terminal,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function HomeContent() {
  const { mainProfile, isLoggedIn, setShowAuthFlow, walletAddress } = useCurrentWallet()

  return (
    <div className="w-full space-y-6 pt-2">
      {/* Welcome Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Terminal size={18} />
          <h1 className="font-mono text-lg font-bold tracking-wider">
            {isLoggedIn && mainProfile
              ? `gm, ${mainProfile.username}`
              : 'Tapestry Explorer'}
          </h1>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          Explore wallets, trade tokens, and connect with the Solana community
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickAction
          href={route('trade')}
          icon={ArrowRightLeft}
          title="Trade"
          description="Swap tokens"
        />
        <QuickAction
          href={route('investigate')}
          icon={Search}
          title="Investigate"
          description="Explore wallets"
        />
        <QuickAction
          href={route('map')}
          icon={Globe}
          title="Map"
          description="Find community"
        />
      </div>

      {/* Connect prompt for non-logged in users */}
      {!isLoggedIn && (
        <div className="bg-card border border-primary/20 rounded-md p-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Zap size={16} />
            <span className="font-mono text-sm font-bold tracking-wider uppercase">
              Get Started
            </span>
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-md mx-auto">
            Connect your wallet to follow users, set your location on the map,
            and track your transactions.
          </p>
          <Button
            onClick={() => setShowAuthFlow(true)}
            className="font-mono text-xs tracking-wider"
          >
            Connect Wallet
          </Button>
        </div>
      )}

      {/* Following section for logged in users */}
      {isLoggedIn && mainProfile && (
        <FollowingSection username={mainProfile.username} />
      )}

      {/* Recent Wallet Activity (when logged in) */}
      {isLoggedIn && walletAddress && (
        <RecentActivity walletAddress={walletAddress} />
      )}

      {/* Network Stats */}
      <div className="bg-card/50 border border-border/20 rounded-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-primary/60" />
          <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            Quick Links
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Trade Tokens', href: route('trade') },
            { label: 'Investigate', href: route('investigate') },
            { label: 'Community Map', href: route('map') },
            { label: 'My Profile', href: isLoggedIn && mainProfile ? route('entity', { id: mainProfile.username }) : '#' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3 py-2 rounded-md border border-border/20 font-mono text-[11px] text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all text-center"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: any
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group bg-card border border-border/30 rounded-md p-4 space-y-2 hover:border-primary/30 hover:bg-primary/5 transition-all"
    >
      <Icon
        size={20}
        className="text-muted-foreground group-hover:text-primary transition-colors"
      />
      <div>
        <p className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  )
}

function FollowingSection({ username }: { username: string }) {
  const [following, setFollowing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFollowing() {
      try {
        const res = await fetch(
          `/api/profiles/${username}/following?pageSize=8`
        )
        if (res.ok) {
          const data = await res.json()
          setFollowing(data?.profiles || data || [])
        }
      } catch (e) {
        console.error('Failed to fetch following:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchFollowing()
  }, [username])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-primary/60" />
          <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            Following
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-32 h-16 rounded-md shrink-0" />
          ))}
        </div>
      </div>
    )
  }

  if (following.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users size={14} className="text-primary/60" />
        <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          Following
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {following.map((user: any) => (
          <Link
            key={user.username || user.id}
            href={route('entity', {
              id: user.username || user.id,
            })}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/20 bg-card/50 hover:border-primary/20 hover:bg-primary/5 transition-all shrink-0"
          >
            <Avatar
              username={user.username || ''}
              imageUrl={user.image}
              size={24}
              className="w-6"
            />
            <span className="font-mono text-xs text-foreground/70 max-w-[80px] truncate">
              {user.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function RecentActivity({ walletAddress }: { walletAddress: string }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch(
          `/api/investigate/transactions?address=${walletAddress}&limit=5&transactionDetails=signatures`
        )
        if (res.ok) {
          const data = await res.json()
          setTransactions(data?.data || [])
        }
      } catch (e) {
        console.error('Failed to fetch recent activity:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchRecent()
  }, [walletAddress])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-primary/60" />
          <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            Recent Activity
          </span>
        </div>
        <Link
          href={route('investigate', { address: walletAddress })}
          className="font-mono text-[10px] text-primary/60 hover:text-primary transition-colors"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-8 rounded" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground/50 py-3">
          No recent transactions
        </p>
      ) : (
        <div className="space-y-0.5">
          {transactions.map((tx: any, i: number) => {
            const sig = tx.signature || tx.transaction?.signatures?.[0] || ''
            const time = tx.blockTime
              ? new Date(tx.blockTime * 1000).toLocaleString()
              : '--'
            return (
              <Link
                key={sig || i}
                href={route('entity', { id: sig })}
                className="flex items-center justify-between px-3 py-2 rounded hover:bg-primary/5 transition-colors"
              >
                <span className="font-mono text-xs text-foreground/60 truncate max-w-[200px]">
                  {sig ? `${sig.slice(0, 12)}...${sig.slice(-6)}` : '--'}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/50">
                  {time}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
