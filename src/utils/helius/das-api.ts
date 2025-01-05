export async function fetchTokenInfo(id: string) {
  try {
    const response = await fetch(`${process.env.RPC_URL}`, {
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
      return false
    }

    const data = await response.json()
    return data
  } catch (error) {
    return false
  }
}
