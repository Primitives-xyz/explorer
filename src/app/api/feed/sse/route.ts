import { SSE_TOKEN_MINT } from '@/constants/jupiter'
import { socialfi } from '@/utils/socialfi'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let lastTimestamp = Date.now()

        while (true) {
          // Fetch latest SSE transactions
          const response = await socialfi.api.activity.swapList({
            tokenAddress: SSE_TOKEN_MINT,
            page: '0',
            pageSize: '20',
          })

          // Filter for SSE transactions
          const sseTransactions = response.transactions.filter(
            (tx) =>
              tx.to.token === SSE_TOKEN_MINT || tx.from.token === SSE_TOKEN_MINT
          )

          // Filter for new transactions since last check
          const newTransactions = sseTransactions.filter(
            (tx) => new Date(tx.timestamp).getTime() > lastTimestamp
          )

          if (newTransactions.length > 0) {
            // Update lastTimestamp to the most recent transaction
            lastTimestamp = Math.max(
              ...newTransactions.map((tx) => new Date(tx.timestamp).getTime())
            )

            // Send new transactions to client
            const message = encoder.encode(
              `data: ${JSON.stringify({
                transactions: newTransactions,
                total: newTransactions.length,
              })}\n\n`
            )
            controller.enqueue(message)
          }

          // Wait for 5 seconds before next check
          await new Promise((resolve) => setTimeout(resolve, 5000))
        }
      } catch (error) {
        console.error('SSE Feed Error:', error)
        controller.error(error)
      }
    },
    cancel() {
      // Handle client disconnect
      console.log('Client disconnected from SSE feed')
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
