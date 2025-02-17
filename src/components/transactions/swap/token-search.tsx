'use client'

import { debounce } from 'lodash'
import { Loader2, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface TokenSearchProps {
  onSelect: (token: {
    address: string
    symbol: string
    name: string
    decimals: number
    logoURI?: string
  }) => void
  onClose: () => void
  hideWhenGlobalSearch?: boolean
}

interface TokenSearchResult {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  price: number | null
  volume_24h_usd: number
  verified: boolean
  market_cap: number
}

const DEFAULT_TOKENS: TokenSearchResult[] = [
  {
    name: 'Solana Social Explorer',
    symbol: 'SSE',
    address: 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',
    decimals: 6,
    logoURI:
      'https://ipfs.io/ipfs/QmT4fG3jhXv3dcvEVdkvAqi8RjXEmEcLS48PsUA5zSb1RY',
    verified: true,
    price: null,
    volume_24h_usd: 0,
    market_cap: 0,
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    verified: true,
    price: null,
    volume_24h_usd: 0,
    market_cap: 0,
  },
  {
    name: 'Wrapped SOL',
    symbol: 'SOL',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    verified: true,
    price: null,
    volume_24h_usd: 0,
    market_cap: 0,
  },
  {
    name: 'Jupiter',
    symbol: 'JUP',
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    decimals: 6,
    logoURI: 'https://static.jup.ag/jup/icon.png',
    verified: true,
    price: null,
    volume_24h_usd: 0,
    market_cap: 0,
  },
]

export function TokenSearch({
  onSelect,
  onClose,
  hideWhenGlobalSearch,
}: TokenSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] =
    useState<TokenSearchResult[]>(DEFAULT_TOKENS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useState(false)

  const t = useTranslations()

  const sortOptions = [
    {
      value: 'marketcap',
      label: t('trade.marketcap'),
    },
    {
      value: 'volume',
      label: t('common.volume'),
    },
    {
      value: 'name',
      label: t('trade.name'),
    },
  ]

  const [sortBy, setSortBy] = useState(sortOptions[0])

  const sortResults = (results: TokenSearchResult[]) => {
    return [...results].sort((a, b) => {
      switch (sortBy.value) {
        case 'marketcap':
        case 'volume':
          // Since we don't have market cap or volume data from Jupiter,
          // fallback to sorting by verified status and then name
          if (a.verified !== b.verified) {
            return b.verified ? 1 : -1
          }
          return a.name.localeCompare(b.name)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }

  const searchTokens = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(DEFAULT_TOKENS)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First try to get token by address if the query looks like a Solana address
      if (query.length === 44 || query.length === 43) {
        try {
          const response = await fetch(
            `https://api.jup.ag/tokens/v1/token/${query}`,
            {
              headers: {
                accept: 'application/json',
              },
            }
          )

          if (response.ok) {
            const token = await response.json()
            if (token) {
              // Map Jupiter token to our common format
              const mappedToken: TokenSearchResult = {
                address: token.address,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                logoURI: token.logoURI,
                price: null, // Jupiter doesn't provide price
                volume_24h_usd: token.daily_volume || 0,
                verified: token.tags?.includes('verified') || false,
                market_cap: 0, // Jupiter doesn't provide market cap
              }
              setSearchResults([mappedToken])
              setIsLoading(false)
              return
            }
          }
        } catch (err) {
          console.log('Token lookup by address failed, trying Birdeye search')
        }
      }

      // If not found by address or not an address, use Birdeye search
      const response = await fetch(
        `https://public-api.birdeye.so/defi/v3/search?chain=solana&keyword=${encodeURIComponent(
          query
        )}&target=token&sort_by=marketcap&sort_type=desc&verify_token=${verifiedOnly}&offset=0&limit=20`,
        {
          headers: {
            'X-API-KEY': 'ce36cc09be9d41d68f9fd4c45346c9f3',
            accept: 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(t('error.failed_to_fetch_tokens'))
      }

      const data = await response.json()
      if (!data.success || !data.data?.items?.[0]?.result) {
        setSearchResults([])
        return
      }

      const mappedResults = data.data.items[0].result
        .filter((item: any) => item.symbol && item.name && item.decimals)
        .map((item: any) => ({
          address: item.address,
          symbol: item.symbol || 'Unknown',
          name: item.name || 'Unknown Token',
          decimals: item.decimals,
          logoURI: item.logo_uri,
          price: item.price,
          volume_24h_usd: item.volume_24h_usd || 0,
          verified: item.verified || false,
          market_cap: item.market_cap || 0,
        }))

      setSearchResults(sortResults(mappedResults))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('error.an_error_occurred')
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const handleGlobalSearch = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        setIsGlobalSearchActive(true)
      }
    }

    const handleGlobalSearchClose = () => {
      setIsGlobalSearchActive(false)
    }

    window.addEventListener('keydown', handleGlobalSearch)
    window.addEventListener('globalSearchClose', handleGlobalSearchClose)

    return () => {
      window.removeEventListener('keydown', handleGlobalSearch)
      window.removeEventListener('globalSearchClose', handleGlobalSearchClose)
    }
  }, [])

  const debouncedSearch = debounce(searchTokens, 300)

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => debouncedSearch.cancel()
  }, [searchQuery])

  if (hideWhenGlobalSearch && isGlobalSearchActive) {
    return null
  }

  const handleSelect = (token: TokenSearchResult) => {
    onSelect({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoURI: token.logoURI,
    })
    onClose()
  }

  const formatMarketCap = (marketCap: number | null) => {
    return t('trade.no_m_cap')
  }

  const formatPrice = (price: number | null) => {
    return t('trade.no_price')
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-green-800 rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        {/* Search Header */}
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 " />
          </div>

          {/* Filter and Sort Options */}
          <div className="flex flex-col gap-2 mt-2">
            {/* Verified Toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm  cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-green-800  focus:ring-green-600 bg-black/80"
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

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto bg-black/95">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin " />
            </div>
          ) : error ? (
            <div className="p-4 text-red-400 text-center bg-red-950/20">
              {error}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-green-800/50">
              {sortResults(searchResults)
                .filter((token) => !verifiedOnly || token.verified)
                .map((token) => (
                  <button
                    key={token.address}
                    className="w-full p-3 flex items-center gap-3 hover:bg-green-950/50 transition-colors text-left"
                    onClick={() => handleSelect(token)}
                  >
                    <div className="relative w-8 h-8 flex-shrink-0">
                      {token.logoURI ? (
                        <div className="w-8 h-8 rounded-full bg-black/40 ring-1 ring-green-800/50 overflow-hidden">
                          <Image
                            src={token.logoURI}
                            alt={token.symbol}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-950 ring-1 ring-green-800/50 flex items-center justify-center">
                          <span className=" text-sm font-medium">
                            {(token.symbol || '??').slice(0, 2)}
                          </span>
                        </div>
                      )}
                      {token.verified && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center ring-1 ring-black">
                          <span className="text-black text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium ">{token.symbol}</span>
                        <span className="/80 text-sm truncate">
                          {token.name}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm /90 font-medium">
                          {formatPrice(token.price)}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">
                            {t('common.m_cap')}:{' '}
                            {formatMarketCap(token.market_cap)}
                          </span>
                          {token.volume_24h_usd > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {t('common.vol')}: $
                                {(token.volume_24h_usd / 1e6).toLocaleString(
                                  undefined,
                                  {
                                    maximumFractionDigits: 2,
                                  }
                                )}
                                {t('common.m')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          ) : searchQuery ? (
            <div className="p-4 text-center">{t('trade.no_tokens_found')}</div>
          ) : (
            <div className="p-4 text-center">
              {t('trade.start_typing_to_search_for_tokens')}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-green-800 bg-green-950/50">
          <button
            onClick={onClose}
            className="w-full bg-green-950 hover:bg-green-900  p-2 rounded transition-colors font-medium"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
