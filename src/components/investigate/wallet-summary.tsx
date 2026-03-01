'use client'

import { Skeleton } from '@/components/ui'
import { Coins, Layers, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WalletData {
  address: string
  solBalance: number
  tokenCount: number
}

export function WalletSummary({ address }: { address: string }) {
  const [data, setData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWallet() {
      try {
        const res = await fetch(`/api/investigate/wallet?address=${address}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (e) {
        console.error('Failed to fetch wallet summary:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchWallet()
  }, [address])

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-md" />
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: 'SOL Balance',
      value: data ? `${data.solBalance.toFixed(4)} SOL` : '--',
      icon: Wallet,
    },
    {
      label: 'Token Accounts',
      value: data ? String(data.tokenCount) : '--',
      icon: Coins,
    },
    {
      label: 'Address Type',
      value: 'Wallet',
      icon: Layers,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-card border border-border/30 rounded-md px-4 py-3 space-y-1"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon size={12} />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
            <p className="font-mono text-lg font-bold text-foreground">
              {stat.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
