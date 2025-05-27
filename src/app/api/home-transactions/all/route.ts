import { IExtendedHeliusTransaction } from '@/components/home-transactions/home-transactions.models'
import { fetchWrapper } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const contentData = await fetchWrapper<{ contents: any[] }>({
      endpoint: `contents`,
      queryParams: {
        orderByDirection: 'DESC',
        orderByField: 'created_at',
        limit: 20,
      },
    })

    // for each contentData. get the content.txSignature and get the transaction from helius api
    const transactionSignatures = contentData?.contents.map((content: any) => {
      return content.content.txSignature
    })

    const transactionPromises = transactionSignatures.map(async (signature) => {
      const transaction = fetchWrapper<IExtendedHeliusTransaction>({
        endpoint: `transactions/${signature}`,
      })

      return transaction
    })

    const transactionsSettled = await Promise.allSettled(transactionPromises)

    const transactions = transactionsSettled.map((transaction) => {
      return transaction.status === 'fulfilled' ? transaction.value : null
    })

    const allTransactions = transactions.map((transaction) => {
      const content = contentData?.contents.find(
        (content) => content.content.txSignature === transaction?.signature
      )

      return {
        ...transaction,
        profile: content?.authorProfile,
        content: content?.content,
      }
    })

    return NextResponse.json(allTransactions)
  } catch (error) {
    console.error('Error fetching all transactions:', error)

    return NextResponse.json(
      { error: 'Failed to fetch all transactions' },
      { status: 500 }
    )
  }
}
