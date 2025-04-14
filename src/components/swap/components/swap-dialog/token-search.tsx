'use client'

import { TokenList } from '@/components/swap/components/swap-dialog/token-list'
import { TokenSearchHeader } from '@/components/swap/components/swap-dialog/token-search-header'
import { useTokenSearch } from '@/components/swap/hooks/use-token-search'
import {
  ITokenInfo,
  ITokenSearchProps,
  ITokenSearchResult,
} from '@/components/swap/swap.models'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui'

export function TokenSearch({
  openModal,
  onSelect,
  onClose,
}: ITokenSearchProps) {
  const {
    searchQuery,
    searchResults,
    isLoading,
    error,
    verifiedOnly,
    sortOptions,
    sortBy,
    setSearchQuery,
    setVerifiedOnly,
    setSortBy,
  } = useTokenSearch()

  const handleSelect = (token: ITokenSearchResult) => {
    const selectedToken: ITokenInfo = {
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
    <Dialog open={openModal} onOpenChange={onClose}>
      <DialogContent className="max-w-lg flex flex-col">
        <DialogHeader>
          <TokenSearchHeader
            searchQuery={searchQuery}
            verifiedOnly={verifiedOnly}
            sortOptions={sortOptions}
            setSearchQuery={setSearchQuery}
            setVerifiedOnly={setVerifiedOnly}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          <TokenList
            isLoading={isLoading}
            error={error}
            searchQuery={searchQuery}
            searchResults={searchResults}
            verifiedOnly={verifiedOnly}
            sortBy={sortBy}
            onSelect={handleSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
