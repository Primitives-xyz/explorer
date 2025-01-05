const RPC_URL = process.env.RPC_URL || ''
interface TokenResponse {
  result: {
    total?: number
    value?: any[]
  }
  error?: {
    message: string
    code: number
  }
}

export async function fetchTokenInfo(id: string) {
  try {
    if (!RPC_URL) {
      throw new Error('RPC_URL is not configured')
    }

    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAsset',
        params: {
          id: id,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching token info:', error)
    return false
  }
}

export async function checkSolanaBusinessFrogHolder({
  walletAddress,
}: {
  walletAddress: string
}): Promise<boolean> {
  try {
    if (!RPC_URL) {
      throw new Error('RPC_URL is not configured')
    }

    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'searchAssets',
        params: {
          ownerAddress: walletAddress,
          grouping: [
            'collection',
            'J7rxtKmEpNJEtrfkagiTF1gsmLyVus6BQZFY4ouBkeMG',
          ],
          page: 1,
          limit: 1000,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: TokenResponse = await response.json()
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`)
    }

    const hasBusinessFrog = (data.result?.total ?? 0) >= 1
    console.log({ hasBusinessFrog, walletAddress })
    return hasBusinessFrog
  } catch (error) {
    console.error('Error checking Business Frog holder status:', error)
    return false
  }
}
