import { Token } from '@/types/Token'

export async function getTokens(address: string): Promise<Token[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_RPC_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'searchAssets',
        params: {
          ownerAddress: address,
          tokenType: 'all',
          displayOptions: {
            showCollectionMetadata: true,
          },
        },
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.result?.items || []
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return []
  }
}
