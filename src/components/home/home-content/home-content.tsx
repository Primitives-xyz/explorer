'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  ArrowRightLeft,
  Radio,
  Search,
  Terminal,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GlobalFeed } from './global-feed'

export function HomeContent() {
  const { mainProfile, isLoggedIn, setShowAuthFlow } = useCurrentWallet()

  return (
    <div className="w-full space-y-6 pt-2">
      {/* Welcome Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Terminal size={18} />
          <h1 className="font-mono text-lg font-bold tracking-wider">
            {isLoggedIn && mainProfile
              ? `gm, ${mainProfile.username}`
              : 'Solana Social Explorer'}
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
          description="Explore a wallet"
        />
        <QuickAction
          href={route('signals')}
          icon={Radio}
          title="Signals"
          description="Live Pump.fun feed"
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
            Connect your wallet to follow users and track your transactions.
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

      {/* Global trade feed */}
      <GlobalFeed />

      {/* Quick Links */}
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
            { label: 'Signals', href: route('signals') },
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
