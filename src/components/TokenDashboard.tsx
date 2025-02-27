'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useNFTImage } from '@/hooks/use-nft-image'
import { useTokenData } from '@/hooks/use-token-data'
import { formatNumber } from '@/utils/format'
import { FungibleToken } from '@/utils/types'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ImageModal } from './tokens/image-modal'

// Token Image component
const TokenImage = ({
  token,
  onImageClick,
}: {
  token: FungibleToken
  onImageClick: (url: string, symbol: string) => void
}) => {
  const { url: imageUrl } = useNFTImage(token.content)

  return (
    <div
      className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center"
      onClick={() => imageUrl && onImageClick(imageUrl, token.symbol)}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={token.symbol}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold">
          {token.symbol.substring(0, 2)}
        </span>
      )}
    </div>
  )
}

export default function TokenDashboard({
  walletAddress,
}: {
  walletAddress: string
}) {
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const {
    tokens,
    fungibleTokens,
    nativeBalance,
    isLoading,
    error,
    refetch,
    hasMoreTokens,
    loadMoreTokens,
    loadingMore,
    progress,
  } = useTokenData(walletAddress, autoLoadEnabled)

  const [selectedImage, setSelectedImage] = useState<{
    url: string
    symbol: string
  } | null>(null)

  // Calculate total value of tokens
  const totalTokenValue = fungibleTokens
    .filter((token) => (token.totalPrice || 0) >= 0.00001)
    .reduce((acc, token) => acc + (token.totalPrice || 0), 0)
  const solValue = nativeBalance?.total_price || 0
  const totalPortfolioValue = totalTokenValue + solValue

  // Colors for the pie chart
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82ca9d',
    '#ffc658',
    '#8dd1e1',
  ]

  // Filter out tokens with very small values (less than 1 cent)
  const significantTokens = fungibleTokens
    .filter((token) => (token.totalPrice || 0) >= 0.00001)
    .sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0)) // Sort by value, highest first

  // Prepare data for pie chart
  const pieData = [
    ...(solValue > 0 ? [{ name: 'SOL', value: solValue }] : []),
    ...significantTokens.map((token) => ({
      name: token.symbol,
      value: token.totalPrice,
    })),
  ]

  const handleImageClick = (url: string, symbol: string) => {
    setSelectedImage({ url, symbol })
  }

  return (
    <Card className="bg-gray-800 text-white overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Token Dashboard</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <label
                htmlFor="autoload-toggle"
                className="text-sm mr-2 cursor-pointer"
              >
                Auto-load all
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="autoload-toggle"
                  name="autoload-toggle"
                  className="sr-only"
                  checked={autoLoadEnabled}
                  onChange={() => setAutoLoadEnabled(!autoLoadEnabled)}
                />
                <div
                  className={`block h-6 rounded-full w-10 ${
                    autoLoadEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    autoLoadEnabled ? 'transform translate-x-4' : ''
                  }`}
                ></div>
              </div>
            </div>
            <button
              className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
              onClick={() => setShowDebug(!showDebug)}
              title="Toggle Debug Panel"
            >
              <span className="text-xs font-mono">DEBUG</span>
            </button>
            <button
              className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                size={18}
                className={isLoading ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="p-4 border-b border-gray-700 bg-gray-900 font-mono text-xs">
            <h3 className="text-sm font-bold mb-2">Debug Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p>Total Tokens: {tokens.length}</p>
                <p>Fungible Tokens: {fungibleTokens.length}</p>
                <p>Has More: {hasMoreTokens ? 'Yes' : 'No'}</p>
                <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
                <p>Loading More: {loadingMore ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p>
                  Progress: {progress.loaded} / {progress.total} (
                  {progress.percentage}%)
                </p>
                <p>Auto-Load: {autoLoadEnabled ? 'Enabled' : 'Disabled'}</p>
                <p>Significant Tokens: {significantTokens.length}</p>
                <p>
                  Dust Tokens:{' '}
                  {fungibleTokens.length - significantTokens.length}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="font-bold">Token Interfaces:</p>
              <div className="max-h-20 overflow-y-auto">
                {Object.entries(
                  tokens.reduce((acc, token) => {
                    acc[token.interface] = (acc[token.interface] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([interface_, count]) => (
                  <p key={interface_}>
                    {interface_}: {count}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="p-6 m-4 border border-red-500 bg-red-900/20 rounded-lg">
            <h3 className="text-xl font-bold text-red-400 mb-2">
              Error Loading Tokens
            </h3>
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              onClick={() => refetch()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content when data is loaded */}
        {!isLoading && !error && (
          <div className="p-6">
            {/* Portfolio Summary */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Portfolio Value</h3>
              <div className="text-3xl font-bold">
                ${formatNumber(totalPortfolioValue)}
              </div>

              {/* Native SOL Balance */}
              {nativeBalance && (
                <div className="mt-2 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="font-bold">SOL</span>
                      </div>
                      <div>
                        <div className="font-semibold">Solana</div>
                        <div className="text-sm text-gray-400">
                          Native Balance
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>${formatNumber(nativeBalance.total_price)}</div>
                      <div className="text-sm">
                        {nativeBalance.lamports / 1000000000} SOL
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Holdings */}
              {fungibleTokens.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Token Holdings
                    {progress.total > 0 && (
                      <span className="text-sm font-normal text-gray-400 ml-2">
                        ({progress.loaded} of {progress.total})
                      </span>
                    )}
                  </h3>

                  {/* Progress bar */}
                  {progress.total > 0 && progress.percentage < 100 && (
                    <div className="w-full h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {significantTokens.map((token, index) => (
                        <motion.div
                          key={token.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <TokenImage
                                token={token}
                                onImageClick={handleImageClick}
                              />
                              <div>
                                <div className="font-semibold">
                                  {token.symbol}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {token.name}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div>${formatNumber(token.totalPrice)}</div>
                              <div className="text-sm">
                                {token.balance / Math.pow(10, token.decimals)}{' '}
                                {token.symbol}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Show count of filtered out dust tokens if any */}
                    {fungibleTokens.length > significantTokens.length && (
                      <div className="text-center text-sm text-gray-400 pt-2">
                        {fungibleTokens.length - significantTokens.length} dust
                        tokens hidden (value &lt; $0.00001)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Portfolio Distribution */}
              {pieData.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Portfolio Distribution
                  </h3>
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [
                            `$${formatNumber(value)}`,
                            'Value',
                          ]}
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Load more button - only show if auto-load is disabled */}
            {hasMoreTokens && !autoLoadEnabled && (
              <div className="pt-4 text-center">
                <button
                  onClick={loadMoreTokens}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw size={16} className="animate-spin mr-2" />
                      Loading...
                    </span>
                  ) : (
                    'Load More Tokens'
                  )}
                </button>
              </div>
            )}

            {/* Loading indicator for auto-load */}
            {loadingMore && autoLoadEnabled && (
              <div className="pt-4 text-center text-gray-400">
                <span className="flex items-center justify-center">
                  <RefreshCw size={16} className="animate-spin mr-2" />
                  Auto-loading tokens...
                </span>
              </div>
            )}

            {/* Empty state */}
            {!isLoading &&
              !error &&
              fungibleTokens.length === 0 &&
              !nativeBalance && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">💰</div>
                  <h3 className="text-xl font-medium mb-2">No Tokens Found</h3>
                  <p className="text-gray-400 mb-6">
                    This wallet doesn't have any tokens yet.
                  </p>
                  <button
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                    onClick={() => refetch()}
                  >
                    Refresh
                  </button>
                </div>
              )}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            isOpen={true}
            onClose={() => setSelectedImage(null)}
            imageUrl={selectedImage.url}
            symbol={selectedImage.symbol}
          />
        )}
      </CardContent>
    </Card>
  )
}
