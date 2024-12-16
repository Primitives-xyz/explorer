export enum TokenType {
  ALL = 'all',
  FUNGIBLE = 'fungible',
  NFT = 'nft',
}

export interface FungibleToken {
  id: string
  name: string
  symbol: string
  imageUrl: string | null
  balance: number
  price?: number
  currency?: string
}

export async function getTokens(
  walletAddress: string,
): Promise<FungibleToken[]> {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_RPC_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'searchAssets',
        params: {
          ownerAddress: walletAddress,
          tokenType: TokenType.ALL,
          displayOptions: {
            showCollectionMetadata: true,
          },
        },
      }),
    })

    const data = await response.json()

    if (!data.result) {
      console.log('No result in data:', data)
      return []
    }

    console.log('HERE: ', data.result.items)

    // Log how many items are fungible tokens
    const fungibleTokens = data.result.items.filter((item: any) => {
      const isFungible = item.interface === 'FungibleToken' && item.token_info
      return isFungible
    })

    console.log('Fungible tokens count:', fungibleTokens.length)

    // Log a sample token to see its structure
    if (fungibleTokens.length > 0) {
      console.log('Sample token structure:', fungibleTokens[0])
    }

    const mappedTokens = fungibleTokens.map((item: any) => ({
      id: item.id,
      name: item.content?.metadata?.name || 'Unknown Token',
      symbol: item.content?.metadata?.symbol || '',
      imageUrl: item.content?.links?.image || null,
      balance:
        Number(item.token_info?.balance || 0) /
        Math.pow(10, item.token_info?.decimals || 0),
      price: item.token_info?.price_info?.price_per_token || 0,
      currency: item.token_info?.price_info?.currency || 'USDC',
    }))

    console.log('Mapped tokens:', mappedTokens)

    return mappedTokens
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return []
  }
}

export interface Transaction {
  description: string
  type: string
  source: string
  fee: number
  feePayer: string
  signature: string
  slot: number
  timestamp: number
  nativeTransfers: {
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }[]
  tokenTransfers: {
    fromUserAccount: string
    toUserAccount: string
    fromTokenAccount: string
    toTokenAccount: string
    tokenAmount: number
    mint: string
  }[]
}

export async function getTransactionHistory(
  walletAddress: string,
  beforeSignature?: string,
  limit?: number,
): Promise<Transaction[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY
    let url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${apiKey}`

    if (beforeSignature) {
      url += `&before=${beforeSignature}`
    }

    const response = await fetch(url)
    const data = await response.json()

    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data)
      return []
    }

    if (limit && limit > 0) {
      return data.slice(0, limit)
    }

    return data
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return []
  }
}
