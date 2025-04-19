import {
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from '@solana/actions'
import { NextRequest } from 'next/server'
import { findTapAddress } from '@/lib/findTapAddress'

// Set blockchain (mainnet or devnet)
const blockchain =
  process.env.NEXT_PUBLIC_NETWORK === 'devnet'
    ? BLOCKCHAIN_IDS.devnet
    : BLOCKCHAIN_IDS.mainnet

// Headers for the Actions API
const headers = {
  ...ACTIONS_CORS_HEADERS,
  'x-blockchain-ids': blockchain,
  'x-action-version': '2.4',
}

// OPTIONS endpoint for CORS
export const OPTIONS = async () => {
  return new Response(null, { headers })
}

export async function POST(req: NextRequest) {
  try {
    // Get user public key from request body (we don't actually need it but keep for consistency)
    const requestBody = await req.json()
    const userAddress = requestBody.account

    if (!userAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: account' }),
        { status: 400, headers }
      )
    }

    // Use our utility function to find a TAP address
    console.log(`[API] Finding TAP address for user: ${userAddress}`)
    const result = await findTapAddress()

    // If we couldn't find a matching keypair, return an error
    if (!result) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not find a suitable address within allowed attempts',
          attempts: 100000 // maxAttempts default from the function
        }),
        { status: 404, headers }
      )
    }

    console.log(`[API] Found TAP address after ${result.attempts} attempts: ${result.publicKey}`)

    // Return the keypair's public key and secret key
    return new Response(
      JSON.stringify(result),
      { status: 200, headers }
    )
  } catch (error: any) {
    console.error('Error finding TAP address:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to find TAP address' }),
      { status: 500, headers }
    )
  }
} 