'use client'

import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { SortOption } from '../../types/token-types'

interface TokenSearchHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  verifiedOnly: boolean
  setVerifiedOnly: (verified: boolean) => void
  sortOptions: SortOption[]
  sortBy: SortOption
  setSortBy: (option: SortOption) => void
}

export function TokenSearchHeader({
  searchQuery,
  setSearchQuery,
  verifiedOnly,
  setVerifiedOnly,
  sortOptions,
  sortBy,
  setSortBy,
}: TokenSearchHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations()

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="p-4 border-b border-green-800 bg-green-950/50">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={t('trade.search_tokens')}
          className="w-full bg-black/80 p-2 pl-10 rounded border border-green-800/50 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
      </div>

      {/* Filter and Sort Options */}
      <div className="flex flex-col gap-2 mt-2">
        {/* Verified Toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-green-800 focus:ring-green-600 bg-black/80"
            />
            {t('trade.verified_tokens_only')}
          </label>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option)}
              className={`text-xs px-2 py-1 rounded ${
                sortBy.value === option.value
                  ? 'bg-green-600'
                  : 'bg-green-900/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
