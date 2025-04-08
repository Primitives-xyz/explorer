import {
  RPCResponse,
  TokenResponse,
} from '@/components-new-version/models/token.models'

export async function fetchTokenInfo(
  id: string
): Promise<TokenResponse | null> {
  try {
    if (!process.env.RPC_URL) {
      console.error('RPC_URL is not configured')
      return null
    }

    const response = await fetch(process.env.RPC_URL, {
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
      console.error(`HTTP error! status: ${response.status}`)
      return null
    }

    const data: RPCResponse = await response.json()

    // Check for RPC error response
    if (data.error) {
      console.error(`RPC error: ${data.error.message}`)
      return null
    }

    // Validate that we have a result
    if (!data.result) {
      console.log('No token data found')
      return null
    }

    return {
      jsonrpc: data.jsonrpc,
      id: data.id,
      result: data.result,
    }
  } catch (error) {
    console.error(
      'Error fetching token info:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return null
  }
}
