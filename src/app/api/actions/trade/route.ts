import { fetchTokenInfo } from '@/utils/helius/das-api'
import { ActionGetResponse, ACTIONS_CORS_HEADERS } from '@solana/actions'
import { NextRequest } from 'next/server'

const DEFAULT_INPUT_MINT = 'So11111111111111111111111111111111111111112' // SOL
const DEFAULT_OUTPUT_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump' // PUMP

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const inputMint = searchParams.get('inputMint') || DEFAULT_INPUT_MINT
  const outputMint = searchParams.get('outputMint') || DEFAULT_OUTPUT_MINT

  // Parallelize token info fetching
  const [token1, token2] = await Promise.all([
    fetchTokenInfo(inputMint),
    fetchTokenInfo(outputMint),
  ])

  // Get token names and images
  const inputTokenName = token1?.result?.content?.metadata?.name || 'SOL'
  const outputTokenName = token2?.result?.content?.metadata?.name || 'PUMP'
  const inputTokenImage =
    token1?.result?.content?.links?.image || '/solana-logo.png'
  const outputTokenImage =
    token2?.result?.content?.links?.image || '/pump-logo.png'

  const inputTokenPrice =
    token1?.result && 'token_info' in token1.result
      ? token1.result.token_info?.price_info?.price_per_token
      : undefined
  const outputTokenPrice =
    token2?.result && 'token_info' in token2.result
      ? token2.result.token_info?.price_info?.price_per_token
      : undefined

  // Create title based on token names
  let title = `Swap ${inputTokenName} to ${outputTokenName}`

  // Create concise, compelling description
  let description
  if (inputTokenPrice && outputTokenPrice && outputTokenPrice > 0) {
    // Calculate how many output tokens you get for 1 input token
    const calculatedRate = inputTokenPrice / outputTokenPrice
    // Use the calculated rate if it's a valid number, otherwise use a generic message
    if (isFinite(calculatedRate) && calculatedRate > 0) {
      const rate = calculatedRate.toFixed(6)
      description = `Get ${rate} ${outputTokenName} for each ${inputTokenName}. Lowest fees on Solana, powered by Jupiter's smart routing.`
    } else {
      description = `Swap ${inputTokenName} to ${outputTokenName} at the best rates. Lowest fees on Solana, powered by Jupiter's smart routing.`
    }
  } else {
    description = `Instantly swap at the best rates with minimal fees. Jupiter's smart routing ensures optimal execution.`
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
          label: `0.01 ${inputTokenName}`,
          href: `/api/actions/donate-sol?amount=0.01`,
        },
        {
          type: 'transaction',
          label: `0.05 ${inputTokenName}`,
          href: `/api/actions/donate-sol?amount=0.05`,
        },
        {
          type: 'transaction',
          label: `0.1 ${inputTokenName}`,
          href: `/api/actions/donate-sol?amount=0.1`,
        },
        {
          type: 'transaction',
          href: `/api/actions/donate-sol?amount={amount}`,
          label: `Swap ${inputTokenName}`,
          parameters: [
            {
              name: 'amount',
              label: `Enter ${inputTokenName} amount`,
              type: 'number',
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
