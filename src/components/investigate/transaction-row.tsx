'use client'

import {
  CheckCircle,
  ChevronRight,
  Copy,
  ExternalLink,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { route } from '@/utils/route'

interface Props {
  transaction: any
  isExpanded: boolean
  onToggle: () => void
}

function formatTime(blockTime: number | null): string {
  if (!blockTime) return '--'
  const date = new Date(blockTime * 1000)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function formatFullTime(blockTime: number | null): string {
  if (!blockTime) return '--'
  return new Date(blockTime * 1000).toLocaleString()
}

function getTransactionType(tx: any): string {
  // Try to detect type from instructions
  const instructions =
    tx.transaction?.message?.instructions || []
  const programs = instructions
    .map((ix: any) => ix.programId || ix.program)
    .filter(Boolean)

  if (
    programs.some(
      (p: string) =>
        p.includes('JUP') ||
        p.includes('whirL') ||
        p.includes('Orca') ||
        p.includes('Raydium')
    )
  ) {
    return 'SWAP'
  }

  if (
    programs.some(
      (p: string) =>
        p === '11111111111111111111111111111111' ||
        p === 'system'
    )
  ) {
    // Check for token transfers
    const innerInstructions = tx.meta?.innerInstructions || []
    if (innerInstructions.length > 2) return 'COMPLEX'
    return 'TRANSFER'
  }

  if (programs.length > 3) return 'COMPLEX'
  return 'OTHER'
}

export function TransactionRow({ transaction, isExpanded, onToggle }: Props) {
  const tx = transaction
  const signatures = tx.transaction?.signatures || []
  const signature = signatures[0] || ''
  const truncatedSig = signature
    ? `${signature.slice(0, 8)}...${signature.slice(-6)}`
    : '--'
  const blockTime = tx.blockTime
  const isSuccess = !tx.meta?.err
  const fee = tx.meta?.fee ? (tx.meta.fee / 1e9).toFixed(6) : '--'
  const txType = getTransactionType(tx)

  const copySig = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(signature)
  }

  return (
    <div className="group">
      <button
        onClick={onToggle}
        className="w-full grid grid-cols-[2rem_1fr_6rem_5rem_1fr] gap-2 items-center px-3 py-2.5 rounded-md hover:bg-primary/5 transition-colors text-left"
      >
        <ChevronRight
          size={14}
          className={`text-muted-foreground/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
        <span className="font-mono text-xs text-foreground/80 truncate">
          {truncatedSig}
        </span>
        <span
          className="font-mono text-[11px] text-muted-foreground"
          title={formatFullTime(blockTime)}
        >
          {formatTime(blockTime)}
        </span>
        <span className="flex items-center gap-1">
          {isSuccess ? (
            <CheckCircle size={12} className="text-primary" />
          ) : (
            <XCircle size={12} className="text-destructive" />
          )}
          <span
            className={`font-mono text-[11px] ${isSuccess ? 'text-primary/80' : 'text-destructive/80'}`}
          >
            {isSuccess ? 'OK' : 'ERR'}
          </span>
        </span>
        <span className="font-mono text-[11px] text-muted-foreground text-right">
          {txType}
        </span>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mx-8 mb-2 p-3 rounded-md bg-card/50 border border-border/20 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Signature + Links */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                Signature
              </span>
              <span className="font-mono text-xs text-foreground/70">
                {`${signature.slice(0, 20)}...${signature.slice(-10)}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={copySig}
                className="p-1 rounded hover:bg-primary/10 text-muted-foreground/50 hover:text-primary transition-colors"
              >
                <Copy size={12} />
              </button>
              <Link
                href={route('entity', { id: signature })}
                className="p-1 rounded hover:bg-primary/10 text-muted-foreground/50 hover:text-primary transition-colors"
              >
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DetailItem label="Slot" value={String(tx.slot || '--')} />
            <DetailItem label="Fee" value={`${fee} SOL`} />
            <DetailItem
              label="Time"
              value={formatFullTime(blockTime)}
            />
            <DetailItem label="Type" value={txType} />
          </div>

          {/* Balance Changes */}
          {tx.meta?.preBalances && tx.meta?.postBalances && (
            <div>
              <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                Balance Changes (SOL)
              </span>
              <div className="mt-1 space-y-0.5">
                {tx.transaction?.message?.accountKeys
                  ?.slice(0, 5)
                  .map((account: any, i: number) => {
                    const pre = tx.meta.preBalances[i] / 1e9
                    const post = tx.meta.postBalances[i] / 1e9
                    const change = post - pre
                    if (Math.abs(change) < 0.000001) return null
                    const pubkey =
                      typeof account === 'string'
                        ? account
                        : account?.pubkey || '--'
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between font-mono text-[11px]"
                      >
                        <span className="text-muted-foreground/60 truncate max-w-[200px]">
                          {pubkey.slice(0, 8)}...{pubkey.slice(-4)}
                        </span>
                        <span
                          className={
                            change > 0
                              ? 'text-primary'
                              : 'text-destructive'
                          }
                        >
                          {change > 0 ? '+' : ''}
                          {change.toFixed(6)}
                        </span>
                      </div>
                    )
                  })
                  .filter(Boolean)}
              </div>
            </div>
          )}

          {/* View Full Transaction Link */}
          <div className="pt-1">
            <Link
              href={route('entity', { id: signature })}
              className="font-mono text-[11px] text-primary/70 hover:text-primary transition-colors"
            >
              View full transaction details →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest block">
        {label}
      </span>
      <span className="font-mono text-xs text-foreground/70">{value}</span>
    </div>
  )
}
