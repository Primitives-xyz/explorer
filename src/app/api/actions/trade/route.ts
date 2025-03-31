import { fetchTokenInfo } from '@/utils/helius/das-api'
import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from '@solana/actions'
import { Connection } from '@solana/web3.js'
import { NextRequest } from 'next/server'

const DEFAULT_INPUT_MINT = 'So11111111111111111111111111111111111111112' // SOL
const DEFAULT_OUTPUT_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump' // PUMP
const DEFAULT_SLIPPAGE_BPS = 50 // 0.5%
const PLATFORM_FEE_BPS = 100 // 1%
const PLATFORM_FEE_ACCOUNT = process.env.PLATFORM_FEE_ACCOUNT || ''

// Create a connection to the Solana blockchain
const connection = new Connection(
  process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
)

// Set blockchain (mainnet or devnet)
const blockchain =
  process.env.NEXT_PUBLIC_NETWORK === 'devnet'
    ? BLOCKCHAIN_IDS.devnet
    : BLOCKCHAIN_IDS.mainnet

// Headers for the Blink API
const headers = {
  ...ACTIONS_CORS_HEADERS,
  'x-blockchain-ids': blockchain,
  'x-action-version': '2.4',
}

// OPTIONS endpoint for CORS
export const OPTIONS = async () => {
  return new Response(null, { headers })
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const inputMint = searchParams.get('inputMint') || DEFAULT_INPUT_MINT
  const outputMint = searchParams.get('outputMint') || DEFAULT_OUTPUT_MINT
  const useSse = searchParams.get('useSse') === 'true'
  console.log({
    inputMint,
    outputMint,
    useSse,
  })
  // Parallelize token info fetching
  const [token1, token2] = await Promise.all([
    fetchTokenInfo(inputMint),
    fetchTokenInfo(outputMint),
  ])

  // Get token names and images
  const inputTokenName = token1?.result?.content?.metadata?.name || 'SOL'
  const outputTokenName = token2?.result?.content?.metadata?.name || 'PUMP'

  const outputTokenImage =
    token2?.result?.content?.links?.image || '/pump-logo.png'
  console.log({
    token1,
  })
  const inputTokenPrice =
    token1?.result && 'token_info' in token1.result
      ? token1.result.token_info?.price_info?.price_per_token
      : undefined
  const outputTokenPrice =
    token2?.result && 'token_info' in token2.result
      ? token2.result.token_info?.price_info?.price_per_token
      : undefined

  // log both tokens price info
  console.log({
    inputTokenPrice,
    outputTokenPrice,
  })

  // Create title based on token names
  let title = `Swap ${inputTokenName} to ${outputTokenName}`

  // Create concise, compelling description
  let description
  if (outputTokenPrice && outputTokenPrice > 0) {
    const price = outputTokenPrice.toFixed(6)
    description = `Buy ${outputTokenName} ($${price}). Lowest fees on swaps, powered by Solana Social Explorer.`
  } else {
    description = `Swap ${inputTokenName} --> ${outputTokenName} at the best rates. Lowest fees on swaps, powered by Solana Social Explorer.`
  }

  const response: ActionGetResponse = {
    type: 'action',
    icon: outputTokenImage,
    label: `Swap ${inputTokenName} to ${outputTokenName}`,
    title,
    description,
    links: {
      actions: [
        {
          type: 'transaction',
          href: `/api/actions/trade?amount={amount}&useSse={useSse}&inputMint=${inputMint}&outputMint=${outputMint}`,
          label: `Buy ${outputTokenName}`,
          parameters: [
            {
              name: 'amount',
              label: `Enter ${inputTokenName} amount`,
              type: 'number',
              required: true,
            },
            {
              name: 'useSse',
              label: 'Use SSE for lowest fees',
              type: 'checkbox',
              required: false,
              options: [{ label: 'Use SSE for lowest fees', value: 'true' }],
            },
          ],
        },
      ],
    },
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: ACTIONS_CORS_HEADERS,
  })
}

export async function POST(req: NextRequest) {
  try {
    // Extract parameters from request
    const url = new URL(req.url)
    const amount = url.searchParams.get('amount')
    const useSse = url.searchParams.get('useSse') === 'true'
    const inputMint = url.searchParams.get('inputMint') || DEFAULT_INPUT_MINT
    const outputMint = url.searchParams.get('outputMint') || DEFAULT_OUTPUT_MINT

    // Get user public key from request body
    const requestBody = await req.json()
    const userPublicKey = requestBody.account

    if (!amount || !userPublicKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers }
      )
    }

    // Step 1: Fetch token info to get decimals
    const inputTokenInfo = await fetchTokenInfo(inputMint)
    console.log({
      inputTokenInfo: inputTokenInfo?.result,
    })
    // Access decimals safely with a fallback
    const inputDecimals =
      inputTokenInfo?.result && 'token_info' in inputTokenInfo.result
        ? inputTokenInfo.result.token_info.decimals
        : 9
    console.log({
      inputDecimals,
    })
    // Calculate amount in base units
    const adjustedAmount = Math.floor(
      Number(amount) * Math.pow(10, inputDecimals)
    )

    // Step 2: Fetch quote from Jupiter
    const quote = await fetchJupiterQuote({
      inputMint,
      outputMint,
      amount: adjustedAmount,
      slippageBps: DEFAULT_SLIPPAGE_BPS,
      platformFeeBps: PLATFORM_FEE_BPS,
      feeAccount: PLATFORM_FEE_ACCOUNT,
    })

    console.log({
      quote,
    })

    if (!quote) {
      return new Response(JSON.stringify({ error: 'Failed to fetch quote' }), {
        status: 500,
        headers,
      })
    }

    // Step 3: Build swap transaction
    const swapTransaction = await buildSwapTransaction({
      quoteResponse: quote,
      userPublicKey,
      slippageBps: DEFAULT_SLIPPAGE_BPS,
      useSse,
    })

    // Step 4: Return transaction to client
    const response: ActionPostResponse = {
      type: 'transaction',
      transaction: swapTransaction.transaction,
    }

    if (swapTransaction.lastValidBlockHeight) {
      ;(response as any).lastValidBlockHeight =
        swapTransaction.lastValidBlockHeight
    }

    if (swapTransaction.computeUnitLimit) {
      ;(response as any).computeUnitLimit = swapTransaction.computeUnitLimit
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Error processing swap request:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process swap' }),
      { status: 500, headers }
    )
  }
}

// Function to fetch quote from Jupiter
async function fetchJupiterQuote({
  inputMint,
  outputMint,
  amount,
  slippageBps,
  platformFeeBps,
  feeAccount,
}: {
  inputMint: string
  outputMint: string
  amount: number
  slippageBps: number
  platformFeeBps: number
  feeAccount: string
}) {
  try {
    const quoteUrl = new URL('https://quote-api.jup.ag/v6/quote')
    quoteUrl.searchParams.append('inputMint', inputMint)
    quoteUrl.searchParams.append('outputMint', outputMint)
    quoteUrl.searchParams.append('amount', amount.toString())
    quoteUrl.searchParams.append('slippageBps', slippageBps.toString())

    // Add platform fee if provided
    if (platformFeeBps && feeAccount) {
      quoteUrl.searchParams.append('platformFeeBps', platformFeeBps.toString())
      quoteUrl.searchParams.append('feeAccount', feeAccount)
    }

    const response = await fetch(quoteUrl.toString())

    if (!response.ok) {
      throw new Error(`Jupiter quote API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Jupiter quote:', error)
    throw error
  }
}

// Function to build swap transaction
async function buildSwapTransaction({
  quoteResponse,
  userPublicKey,
  slippageBps,
  useSse,
}: {
  quoteResponse: any
  userPublicKey: string
  slippageBps: number
  useSse: boolean
}) {
  try {
    // Try multiple Jupiter API endpoints
    const endpoints = [
      'https://api.jup.ag/swap/v1/swap',
      'https://quote-api.jup.ag/v4/swap',
      'https://quote-api.jup.ag/v6/swap',
    ]

    let response = null
    let lastError = null

    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        const swapUrl = new URL(endpoint)

        const swapData: any = {
          quoteResponse,
          userPublicKey,
          wrapAndUnwrapSol: true,
          slippageBps,
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 1000000,
              priorityLevel: 'veryHigh',
            },
          },
        }

        // Only add feeAccount if it's actually set
        if (PLATFORM_FEE_ACCOUNT && PLATFORM_FEE_ACCOUNT.length > 0) {
          swapData.feeAccount = PLATFORM_FEE_ACCOUNT
        }

        console.log(`Trying endpoint ${endpoint}`)
        console.log('Swap request payload:', JSON.stringify(swapData))

        response = await fetch(swapUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(swapData),
        })

        if (response.ok) {
          console.log(`Successfully used endpoint: ${endpoint}`)
          break // Exit the loop if successful
        }

        // Log the error and try the next endpoint
        const errorClone = response.clone()
        const errorDetails = await errorClone.text()
        console.error(`Error with endpoint ${endpoint}:`, errorDetails)
        lastError = new Error(
          `Jupiter swap API error (${endpoint}): ${response.statusText}`
        )
      } catch (err: any) {
        console.error(`Error with endpoint ${endpoint}:`, err)
        lastError = err
      }
    }

    // If no endpoint worked, throw the last error
    if (!response || !response.ok) {
      throw lastError || new Error('All Jupiter swap API endpoints failed')
    }

    const swapResponse = await response.json()

    // Different API versions might use different field names
    const transaction =
      swapResponse.swapTransaction || swapResponse.encodedTransaction

    if (!transaction) {
      console.error('Transaction data missing in response:', swapResponse)
      throw new Error('Invalid swap response: No transaction data found')
    }

    // Return the transaction and any metadata
    return {
      transaction,
      lastValidBlockHeight: swapResponse.lastValidBlockHeight,
      computeUnitLimit: swapResponse.computeUnitLimit,
      prioritizationFeeLamports: swapResponse.prioritizationFeeLamports,
    }
  } catch (error: any) {
    console.error('Error building swap transaction:', error)
    console.log(
      'Jupiter API might have changed. Check the documentation at https://dev.jup.ag/docs/swap-api'
    )
    throw error
  }
}
