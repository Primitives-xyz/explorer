'use client'

import { TokenList } from '@/components-new-version/swap/components/swap-dialog/token-list'
import { TokenSearchHeader } from '@/components-new-version/swap/components/swap-dialog/token-search-header'
import { useTokenSearch } from '@/components-new-version/swap/hooks/use-token-search'
import {
  TokenInfo,
  TokenSearchProps,
  TokenSearchResult,
} from '@/components-new-version/swap/types/token-types'
import { useTranslations } from 'next-intl'

export function TokenSearch({ onSelect, onClose }: TokenSearchProps) {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    verifiedOnly,
    setVerifiedOnly,
    sortOptions,
    sortBy,
    setSortBy,
  } = useTokenSearch()
  const t = useTranslations()

  const handleSelect = (token: TokenSearchResult) => {
    const selectedToken: TokenInfo = {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoURI: token.logoURI,
    }
    onSelect(selectedToken)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-green-800 rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        {/* Search Header */}
        <TokenSearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          verifiedOnly={verifiedOnly}
          setVerifiedOnly={setVerifiedOnly}
          sortOptions={sortOptions}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto bg-black/95">
          <TokenList
            isLoading={isLoading}
            error={error}
            searchQuery={searchQuery}
            searchResults={searchResults}
            verifiedOnly={verifiedOnly}
            sortBy={sortBy.value}
            onSelect={handleSelect}
          />
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-green-800 bg-green-950/50">
          <button
            onClick={onClose}
            className="w-full bg-green-950 hover:bg-green-900 p-2 rounded transition-colors font-medium"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
