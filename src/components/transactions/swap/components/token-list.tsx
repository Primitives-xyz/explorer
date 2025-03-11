'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TokenSearchResult } from '../types/token-types'
import { sortTokenResults } from '../utils/token-utils'
import { TokenListItem } from './token-list-item'

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

  const filteredResults = sortTokenResults(searchResults, sortBy)
    .filter((token) => !verifiedOnly || token.verified)
    .sort((a, b) => (b.prioritized ? 1 : -1))

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
