'use client'

import { TokenListItem } from '@/components-new-version/swap/components/swap-dialog/token-list-item'
import { ITokenSearchResult } from '@/components-new-version/swap/swap.models'
import { sortTokenResults } from '@/components-new-version/swap/utils/token-utils'
import { Spinner } from '@/components-new-version/ui'
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
    return <div className="p-4 text-center">no verified tokens found</div>
  }

  return (
    <div>
      {filteredResults.map((token) => (
        <TokenListItem key={token.address} token={token} onSelect={onSelect} />
      ))}
    </div>
  )
}
