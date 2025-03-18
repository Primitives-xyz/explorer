import useSWR from 'swr'

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const BAD_SOL_MINT = 'So11111111111111111111111111111111111111111'
export const GOOD_INPUT_SOL = 'So11111111111111111111111111111111111111112'
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      `HTTP ${response.status}: ${errorData.error || 'Unknown error'}`
    )
  }
  return response.json()
}

export function useTokenUSDCPrice(
  tokenMint: string | undefined | null,
  decimals: number = 6
) {
  const shouldFetch = tokenMint && tokenMint !== USDC_MINT
  const amount = Math.pow(10, decimals || 6) // 1 token in base units
  const isSol = tokenMint === BAD_SOL_MINT
  tokenMint = isSol ? GOOD_INPUT_SOL : tokenMint
  const url =
    shouldFetch && tokenMint !== USDC_MINT
      ? `/api/jupiter/quote?inputMint=${tokenMint}&outputMint=${USDC_MINT}&amount=${amount}&slippageBps=50`
      : null

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: 60000, // Increased from 25s to 60s
    dedupingInterval: 10000, // Increased from 1s to 10s
    keepPreviousData: true,
    revalidateOnFocus: false, // Don't revalidate when window regains focus
    revalidateIfStale: false, // Don't revalidate if data is stale
  })

  // Special case for USDC - always worth $1
  if (tokenMint === USDC_MINT) {
    return { price: 1, loading: false, error: null }
  }

  const processedPrice =
    data && !error ? Number(data.outAmount) / Math.pow(10, 6) : null
  const isValidPrice =
    processedPrice !== null && !isNaN(processedPrice) && processedPrice > 0

  if (data && !isValidPrice) {
    console.error(`Invalid price for ${tokenMint}:`, { processedPrice, data })
  }

  return {
    price: isValidPrice ? processedPrice : null,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch token price'
      : null,
  }
}
