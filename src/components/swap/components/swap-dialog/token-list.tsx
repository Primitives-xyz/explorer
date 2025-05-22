'use client'

import { TokenListItem } from '@/components/swap/components/swap-dialog/token-list-item'
import { ITokenSearchResult } from '@/components/swap/swap.models'
import { sortTokenResults } from '@/components/swap/utils/token-utils'
import { Spinner } from '@/components/ui'
import { useTranslations } from 'next-intl'

interface TokenListProps {
  isLoading: boolean
  error: string | null
  searchQuery: string
  searchResults: ITokenSearchResult[]
  verifiedOnly: boolean
  sortBy: string
  onSelect: (token: ITokenSearchResult) => void
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
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-destructive text-center">{error}</div>
  }

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="p-4 text-center">
        {searchQuery
          ? t('trade.no_tokens_found')
          : t('trade.start_typing_to_search_for_tokens')}
      </div>
    )
  }

  // Safely filter and sort tokens
  const safeResults = searchResults.filter(
    (token) =>
      token &&
      typeof token.address === 'string' &&
      typeof token.symbol === 'string'
  )

  const filteredResults = sortTokenResults(safeResults, sortBy).filter(
    (token) => !verifiedOnly || Boolean(token.verified)
  )

  if (filteredResults.length === 0) {
    return (
      <div className="p-4 text-center">
        {t('swap.token.no_verified_tokens')}
      </div>
    )
  }

  return (
    <div>
      {filteredResults.map((token) => (
        <TokenListItem key={token.address} token={token} onSelect={onSelect} />
      ))}
    </div>
  )
}
