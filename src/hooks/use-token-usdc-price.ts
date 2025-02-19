import useSWR from 'swr'

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const SOL_MINT = 'So11111111111111111111111111111111111111112'

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
  const shouldFetch =
    tokenMint && (tokenMint === SOL_MINT || tokenMint === USDC_MINT)
  const amount = Math.pow(10, decimals || 6) // 1 token in base units

  const url =
    shouldFetch && tokenMint !== USDC_MINT
      ? `/api/jupiter/quote?inputMint=${tokenMint}&outputMint=${USDC_MINT}&amount=${amount}&slippageBps=50`
      : null

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: 25000, // 25 seconds
    dedupingInterval: 1000, // Dedupe requests within 1 second
    keepPreviousData: true,
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
