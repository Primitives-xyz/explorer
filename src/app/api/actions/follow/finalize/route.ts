import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { ACTIONS_CORS_HEADERS, ActionPostResponse } from '@solana/actions'
import { NextRequest } from 'next/server'

// This endpoint receives the user-signed transaction and sends it to backend
export async function POST(req: NextRequest) {
  try {
    const { account, signature, transaction } = await req.json()

    if (!account || !transaction) {
      return new Response(
        JSON.stringify({ error: 'account and transaction are required' }),
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      )
    }

    // Send the partially signed transaction to backend for final processing
    // Backend will:
    // 1. Verify the user's signature
    // 2. Add its own signature as fee payer
    // 3. Submit to the blockchain
    // 4. Finalize the follow relationship in DB
    const backendResponse = await fetchTapestryServer({
      endpoint: 'followers/finalizeTransaction',
      method: FetchMethod.POST,
      data: {
        userWallet: account,
        signedTransaction: transaction,
        // Include the signature if needed for verification
        userSignature: signature,
      },
    })

    if (!backendResponse?.success) {
      throw new Error(backendResponse?.error || 'Failed to finalize follow')
    }

    const response: ActionPostResponse = {
      type: 'post',
      message: `Successfully followed @${
        backendResponse.followedUsername || 'user'
      }`,
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: ACTIONS_CORS_HEADERS,
    })
  } catch (error: any) {
    console.error('Error finalizing follow transaction:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    )
  }
}

export const OPTIONS = async () => {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS })
}
