'use client'

import { TokenList } from '@/components/swap/components/swap-dialog/token-list'
import { TokenSearchHeader } from '@/components/swap/components/swap-dialog/token-search-header'
import { useTokenSearch } from '@/components/swap/hooks/use-token-search'
import {
  ITokenInfo,
  ITokenSearchProps,
  ITokenSearchResult,
} from '@/components/swap/swap.models'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { useTranslations } from 'next-intl'

export function TokenSearch({
  openModal,
  onSelect,
  onClose,
}: ITokenSearchProps) {
  const t = useTranslations()
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
      <VisuallyHidden>
        <DialogTitle>Token Search</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="max-w-lg flex flex-col max-sm:w-[95vw] max-sm:h-[calc(100vh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-4rem)] max-sm:p-0">
        <DialogHeader className="max-sm:px-0">
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
        <div className="max-h-[400px] overflow-y-auto max-sm:flex-1 max-sm:px-4">
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
