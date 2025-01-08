interface TokenMetadata {
  symbol: string
  name: string
  image: string
  decimals: number
  price?: number
}

const TOKEN_METADATA_CACHE: { [mint: string]: TokenMetadata } = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    image: '/tokens/sol.png', // Add default SOL logo
    decimals: 9,
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    image: '/tokens/usdc.png', // Add default USDC logo
    decimals: 6,
  },
}

export const getTokenMetadata = async (mint: string): Promise<TokenMetadata> => {
  // Return cached metadata if available
  if (TOKEN_METADATA_CACHE[mint]) {
    return TOKEN_METADATA_CACHE[mint]
  }

  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/tokens/metadata?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mintAccounts: [mint] }),
      }
    )

    const data = await response.json()
    const metadata = data[0]

    // Cache the metadata
    TOKEN_METADATA_CACHE[mint] = {
      symbol: metadata.symbol,
      name: metadata.name,
      image: metadata.image || '',
      decimals: metadata.decimals,
      price: metadata.price_info?.price_per_token,
    }

    return TOKEN_METADATA_CACHE[mint]
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    return {
      symbol: mint.slice(0, 4),
      name: 'Unknown Token',
      image: '',
      decimals: 9,
    }
  }
} 