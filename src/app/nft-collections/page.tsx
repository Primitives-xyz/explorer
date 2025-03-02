'use client'

import { useState } from 'react'
import NFTCollectionView from '../../components/NFTCollectionView'
import { useGroupedNFTData } from '../../hooks/use-grouped-nft-data'

export default function NFTCollectionsPage() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')
  const [disableSpamFilter, setDisableSpamFilter] = useState<boolean>(false)

  // Use the hook to get NFT data only to check loading and error states
  const {
    isLoading,
    error,
    updateSpamFilterCriteria,
    spamFilterEnabled,
    toggleSpamFilter,
  } = useGroupedNFTData(walletAddress || '', false, false, 100, false)

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setWalletAddress(inputValue.trim())
  }

  // Handle disabling spam filter
  const handleDisableSpamFilter = () => {
    setDisableSpamFilter(true)
    toggleSpamFilter() // Turn off spam filter

    // Also update criteria to be more permissive
    updateSpamFilterCriteria({
      suspiciousCollectionSizes: {
        min: 0,
        max: 0, // Effectively disable collection size check
      },
      nameKeywords: [], // Empty array to disable name keyword checks
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">NFT Collections Explorer</h1>

      <div className="mb-8">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter Solana wallet address"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'View Collections'}
          </button>
        </form>
      </div>

      {walletAddress && (
        <div className="mb-4">
          <button
            onClick={handleDisableSpamFilter}
            disabled={disableSpamFilter}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            {disableSpamFilter
              ? 'Spam Filter Disabled'
              : 'Disable Spam Filter (Show All NFTs)'}
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Use this if you're missing NFTs that might be incorrectly flagged as
            spam
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-8">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {walletAddress && !error && (
        <div className="relative">
          <NFTCollectionView walletAddress={walletAddress} />
        </div>
      )}

      {!walletAddress && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Enter a Solana wallet address to view NFT collections
          </p>
          <div className="mt-4">
            <p className="text-sm text-gray-400">Example addresses:</p>
            <button
              onClick={() =>
                setInputValue('DWiD4EVUtnsgqoqnK8JSNNhZBY1hJGpMx7Bv3YwHJm4h')
              }
              className="text-blue-500 hover:underline text-sm mt-1"
            >
              DWiD4EVUtnsgqoqnK8JSNNhZBY1hJGpMx7Bv3YwHJm4h
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
