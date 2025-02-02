import { NextResponse } from 'next/server'

interface TokenResponse {
  total: number
  limit: number
  page: number
  items: any[]
  nativeBalance?: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('address')
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '100')

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 },
    )
  }

  if (!process.env.RPC_URL) {
    return NextResponse.json(
      { error: 'RPC URL is not configured' },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(process.env.RPC_URL, {
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
          tokenType: type,
          page,
          limit,
          displayOptions: {
            showCollectionMetadata: true,
            showInscription: true,
            showNativeBalance: true,
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || 'RPC error occurred')
    }

    const result = data.result as TokenResponse
    const items = result?.items || []

    // Process tokens based on type
    const processedTokens = items.map((item: any) => {
      const baseToken = {
        id: item.id,
        interface: item.interface,
        name: item.content?.metadata?.name || 'Unknown Token',
        symbol: item.content?.metadata?.symbol || '',
        imageUrl:
          item.content?.links?.image ||
          item.content?.files?.[0]?.uri ||
          item.content?.json_uri ||
          null,
        mint: item.id,
        compressed: item.compressed || false,
        authorities: item.authorities || [],
        creators: item.creators || [],
        mutable: item.mutable,
        burnt: item.burnt || false,
        content: item.content,
      }

      // Add fungible token specific info
      if (item.token_info) {
        return {
          ...baseToken,
          balance:
            Number(item.token_info.balance || 0) /
            Math.pow(10, item.token_info.decimals || 0),
          decimals: item.token_info.decimals,
          supply: item.token_info.supply,
          price: item.token_info.price_info?.price_per_token || 0,
          totalPrice: item.token_info.price_info?.total_price || 0,
          currency: item.token_info.price_info?.currency || 'USDC',
          tokenProgram: item.token_info.token_program,
          associatedTokenAddress: item.token_info.associated_token_address,
        }
      }

      // Add NFT specific info
      if (item.supply) {
        return {
          ...baseToken,
          supply: {
            printMaxSupply: item.supply.print_max_supply,
            printCurrentSupply: item.supply.print_current_supply,
            editionNonce: item.supply.edition_nonce,
            editionNumber: item.supply.edition_number,
          },
        }
      }

      // Add inscription data if available
      if (item.inscription) {
        return {
          ...baseToken,
          inscription: {
            order: item.inscription.order,
            size: item.inscription.size,
            contentType: item.inscription.contentType,
            encoding: item.inscription.encoding,
            validationHash: item.inscription.validationHash,
            inscriptionDataAccount: item.inscription.inscriptionDataAccount,
            authority: item.inscription.authority,
          },
        }
      }

      return baseToken
    })

    return NextResponse.json({
      total: result.total || processedTokens.length,
      limit: result.limit || limit,
      page: result.page || page,
      items: processedTokens,
      nativeBalance: result.nativeBalance,
    })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch tokens'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
