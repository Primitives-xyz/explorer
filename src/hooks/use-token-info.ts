import { cacheTokenInfo, getCachedTokenInfo } from '@/lib/token-db'
import type { FungibleTokenInfo, TokenResponse } from '@/types/Token'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

const CACHE_DURATION = 30_000 // 30 seconds cache duration

export function useTokenInfo(mint?: string | null) {
  const [data, setData] = useState<TokenResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const t = useTranslations()

  useEffect(() => {
    if (!mint) {
      setData(null)
      setLoading(false)
      setError(undefined)
      return
    }

    const fetchTokenInfo = async () => {
      // Check IndexedDB cache first
      try {
        const cached = await getCachedTokenInfo(mint)
        const now = Date.now()

        // If we have valid cached data, use it
        if (cached && now - cached.timestamp < CACHE_DURATION) {
          setData(cached.data)
          setError(cached.error)
          return
        }
      } catch (err) {
        console.error(t('error.error_reading_from_indexed_db'), err)
        // Continue with API fetch if cache read fails
      }

      setLoading(true)
      setError(undefined)

      try {
        const response = await fetch(`/api/token?mint=${mint}`)
        if (!response.ok) {
          throw new Error(t('error.failed_to_fetch_token_info'))
        }

        const tokenData = await response.json()

        // Update IndexedDB cache
        await cacheTokenInfo({
          mint,
          data: tokenData,
          timestamp: Date.now(),
        })

        setData(tokenData)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : t('error.failed_to_load_token_data')

        // Cache errors too to prevent hammering failed requests
        try {
          await cacheTokenInfo({
            mint,
            data: null,
            timestamp: Date.now(),
            error: errorMessage,
          })
        } catch (cacheErr) {
          console.error(t('error.error_caching_token_error'), cacheErr)
        }

        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenInfo()
  }, [mint])

  // Helper function to check if token is fungible
  const isFungibleToken = (
    data: TokenResponse | null
  ): data is TokenResponse & { result: FungibleTokenInfo } => {
    return (
      data?.result?.interface === 'FungibleToken' ||
      data?.result?.interface === 'FungibleAsset'
    )
  }

  return {
    data,
    loading,
    error,
    // Helper getters for commonly used data
    symbol: data?.result?.content?.metadata?.symbol,
    name: data?.result?.content?.metadata?.name,
    image: data?.result?.content?.links?.image,
    decimals: isFungibleToken(data)
      ? data.result.token_info.decimals
      : undefined,
  }
}
