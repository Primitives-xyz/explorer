import { LargestHolders } from '@/components/tokens/largest-holders'
import { TokenInformation } from '@/components/tokens/token-information'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

interface TokenDetailsTabsProps {
  id: string
  overview: any
  isLoading: boolean
  decimals: number
  tokenProgram: string
  authorities: any[]
  description?: string
  totalSupply?: number
}

export function TokenDetailsTabs({
  id,
  overview,
  isLoading,
  decimals,
  tokenProgram,
  authorities,
  description,
  totalSupply,
}: TokenDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState('about')

  return (
    <div className="bg-black/40 border border-green-800/40 rounded-xl overflow-hidden">
      <div className="flex border-b border-green-800/40">
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 text-sm font-mono ${
            activeTab === 'about'
              ? 'text-green-400 bg-green-900/20 border-b border-green-500'
              : 'text-gray-400 hover:text-gray-200 hover:bg-green-900/10'
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('holders')}
          className={`px-4 py-2 text-sm font-mono ${
            activeTab === 'holders'
              ? 'text-green-400 bg-green-900/20 border-b border-green-500'
              : 'text-gray-400 hover:text-gray-200 hover:bg-green-900/10'
          }`}
        >
          Token Holders
        </button>
        <button
          onClick={() => setActiveTab('markets')}
          className={`px-4 py-2 text-sm font-mono ${
            activeTab === 'markets'
              ? 'text-green-400 bg-green-900/20 border-b border-green-500'
              : 'text-gray-400 hover:text-gray-200 hover:bg-green-900/10'
          }`}
        >
          Markets
        </button>
      </div>
      <div className="p-4  overflow-y-auto">
        {activeTab === 'about' && (
          <div>
            {!isLoading && overview ? (
              <div>
                <p className="text-sm mb-4 text-gray-300">
                  {description || 'No description available.'}
                </p>
                <TokenInformation
                  id={id}
                  overview={overview}
                  decimals={decimals}
                  tokenProgram={tokenProgram}
                  authorities={authorities}
                />
              </div>
            ) : (
              <Skeleton className="h-64 w-full bg-green-900/20" />
            )}
          </div>
        )}
        {activeTab === 'holders' && (
          <div>
            <LargestHolders mintAddress={id} totalSupply={totalSupply || 0} />
          </div>
        )}
        {activeTab === 'markets' && (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-gray-400 px-4 py-2 border-b border-green-800/20">
              <span>Market</span>
              <span>Price</span>
              <span>24h Volume</span>
              <span>Liquidity</span>
            </div>
            <div className="text-center py-4 text-gray-400 text-sm">
              <p>Market data will be displayed here.</p>
              <p className="text-xs mt-1">Coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
