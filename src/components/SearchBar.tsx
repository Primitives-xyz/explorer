'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { ChangeEvent } from 'react'

interface SearchBarProps {
  walletAddress: string
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSearch: () => Promise<void>
  loading?: boolean
  hasSearched?: boolean
}

export default function SearchBar({
  walletAddress,
  handleInputChange,
  handleSearch,
  loading = false,
  hasSearched = false,
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (walletAddress && !loading) {
      await handleSearch()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="text-green-500 text-xs mb-2 font-mono">
        <span className="opacity-60">SYSTEM:</span> Enter wallet address to
        analyze social graph...
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 bg-black/30 border border-green-800 p-2">
          <span className="text-green-500 font-mono">$</span>
          <input
            type="text"
            placeholder="BprhcaJtUTER4e3ArGYC1bmgjqvyuh1rovY3p8dgv2Eq"
            value={walletAddress}
            onChange={handleInputChange}
            className="flex-1 bg-transparent font-mono text-green-400 placeholder-green-800 
                     focus:outline-none focus:ring-0 border-none text-sm"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!walletAddress || loading}
            className="px-4 py-1 font-mono text-sm border border-green-600 text-green-400
                     hover:bg-green-900/20 disabled:opacity-50 disabled:hover:bg-transparent
                     transition-colors duration-150"
          >
            {loading ? '[PROCESSING...]' : '[EXECUTE]'}
          </button>
        </div>

        <div className="absolute -bottom-6 left-0 right-0">
          <div className="text-xs font-mono">
            {loading ? (
              <span className="text-yellow-500">
                {`>>>`} ANALYZING WALLET DATA...
              </span>
            ) : walletAddress && !hasSearched ? (
              <span className="text-green-600">
                {`>>>`} READY TO ANALYZE {walletAddress.slice(0, 8)}...
              </span>
            ) : hasSearched ? (
              <span className="text-green-600">
                {`>>>`} ANALYZING {walletAddress.slice(0, 8)}...
              </span>
            ) : (
              <span className="text-green-800">{`>>>`}_ AWAITING INPUT</span>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
