import type { FungibleToken } from '@/utils/types'
import { useMemo } from 'react'
import { SortControls } from './sort-controls'
import { TokenListItem } from './token-list-item'

interface TokenListProps {
  tokens: FungibleToken[]
  totalValue: number
  expandedTokenId: string | null
  onExpand: (id: string) => void
  onImageClick: (url: string, symbol: string) => void
  sortBy: 'value' | 'balance' | 'symbol'
  onSort: (sort: 'value' | 'balance' | 'symbol') => void
}

export const TokenList = ({
  tokens,
  totalValue,
  expandedTokenId,
  onExpand,
  onImageClick,
  sortBy,
  onSort,
}: TokenListProps) => {
  const sortedTokens = useMemo(
    () =>
      [...tokens].sort((a, b) => {
        switch (sortBy) {
          case 'value':
            return b.balance * (b.price || 0) - a.balance * (a.price || 0)
          case 'balance':
            return b.balance - a.balance
          case 'symbol':
            return a.symbol.localeCompare(b.symbol)
          default:
            return 0
        }
      }),
    [tokens, sortBy]
  )

  return (
    <div className="flex flex-col">
      <div className="flex-shrink-0">
        <SortControls sortBy={sortBy} onSort={onSort} />
      </div>
      <div className="divide-y divide-green-800/30">
        {sortedTokens.map((token) => (
          <TokenListItem
            key={token.id}
            token={token}
            totalValue={totalValue}
            expandedTokenId={expandedTokenId}
            onExpand={onExpand}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    </div>
  )
}
