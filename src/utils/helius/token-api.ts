const COMMON_TOKENS = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    decimals: 9
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    decimals: 6
  },
  // Add more common tokens as needed
}

interface TokenMetadata {
  symbol: string
  name: string
  image: string
  decimals: number
}

const TOKEN_METADATA_CACHE: { [mint: string]: TokenMetadata } = { ...COMMON_TOKENS }

export const getTokenMetadata = async (mint: string): Promise<TokenMetadata> => {
  // Return cached metadata if available
  if (TOKEN_METADATA_CACHE[mint]) {
    return TOKEN_METADATA_CACHE[mint]
  }

  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
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
      symbol: metadata.symbol || mint.slice(0, 4),
      name: metadata.name || 'Unknown Token',
      image: metadata.image || '',
      decimals: metadata.decimals || 9
    }

    return TOKEN_METADATA_CACHE[mint]
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    // Return a default metadata object if the API call fails
    return {
      symbol: mint.slice(0, 4),
      name: 'Unknown Token',
      image: '',
      decimals: 9
    }
  }
}