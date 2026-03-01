'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HeaderWithInfo } from './info-tip'
import type { CreatorSelfSellAlert } from './signals-types'

interface Props {
  alerts: CreatorSelfSellAlert[]
  onSelectWallet: (wallet: string) => void
}

export function LiveFeed({ alerts, onSelectWallet }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Watching for creator self-sells and notable wallet activity...
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Time</TableHead>
          <TableHead className="w-[80px]">
            <HeaderWithInfo
              label="Type"
              info={
                <>
                  <span className="font-semibold text-amber-400">SELF-SELL</span>
                  : A wallet that created a token on Pump.fun was detected
                  selling that same token. This fires in real-time as the sell
                  transaction is confirmed on-chain.
                </>
              }
            />
          </TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead>Token</TableHead>
          <TableHead>
            <HeaderWithInfo
              label="Amount"
              info="SOL amount from the sell TradeEvent's solAmount field (bonding curve output, before fees)."
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert, idx) => (
          <TableRow
            key={`${alert.wallet}-${alert.timestamp}-${idx}`}
            className="cursor-pointer"
            onClick={() => onSelectWallet(alert.wallet)}
          >
            <TableCell className="text-xs text-muted-foreground font-mono">
              {formatTime(alert.timestamp)}
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                SELF-SELL
              </span>
            </TableCell>
            <TableCell className="font-mono text-xs">
              <span className="text-primary hover:underline">
                {alert.wallet.slice(0, 4)}...{alert.wallet.slice(-4)}
              </span>
            </TableCell>
            <TableCell className="text-sm font-medium">
              {alert.symbol || alert.mint.slice(0, 8)}
            </TableCell>
            <TableCell className="font-mono text-sm text-red-400">
              {formatSol(alert.sellVolume)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatSol(lamports: number): string {
  const sol = lamports / 1e9
  if (sol >= 1000) return `${(sol / 1000).toFixed(1)}K SOL`
  if (sol >= 1) return `${sol.toFixed(2)} SOL`
  return `${sol.toFixed(4)} SOL`
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
