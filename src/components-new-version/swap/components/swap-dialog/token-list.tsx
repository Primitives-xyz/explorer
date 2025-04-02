'use client'

import { TokenListItem } from '@/components-new-version/swap/components/swap-dialog/token-list-item'
import { TokenSearchResult } from '@/components-new-version/swap/types/token-types'
import { sortTokenResults } from '@/components-new-version/swap/utils/token-utils'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TokenListProps {
  isLoading: boolean
  error: string | null
  searchQuery: string
  searchResults: TokenSearchResult[]
  verifiedOnly: boolean
  sortBy: string
  onSelect: (token: TokenSearchResult) => void
}

export function TokenList({
  isLoading,
  error,
  searchQuery,
  searchResults,
  verifiedOnly,
  sortBy,
  onSelect,
}: TokenListProps) {
  const t = useTranslations()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-400 text-center bg-red-950/20">{error}</div>
    )
  }

  if (searchResults.length === 0) {
    return (
      <div className="p-4 text-center">
        {searchQuery
          ? t('trade.no_tokens_found')
          : t('trade.start_typing_to_search_for_tokens')}
      </div>
    )
  }

  const filteredResults = sortTokenResults(searchResults, sortBy).filter(
    (token) => !verifiedOnly || token.verified
  )

  if (filteredResults.length === 0) {
    return (
      <div className="p-4 text-center">
        {t('trade.no_verified_tokens_found')}
      </div>
    )
  }

  return (
    <div className="divide-y divide-green-800/50">
      {filteredResults.map((token) => (
        <TokenListItem key={token.address} token={token} onSelect={onSelect} />
      ))}
    </div>
  )
}
