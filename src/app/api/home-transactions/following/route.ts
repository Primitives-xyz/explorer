import {
  ETransactionType,
  IExtendedHeliusTransaction,
  IHomeTransaction,
} from '@/components/home-transactions/home-transactions.models'
import { IGetSocialResponse } from '@/components/tapestry/models/profiles.models'
import { fetchWrapper } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // 1. Get all following profiles
    // Getting only first page of profiles for now

    const profilesData = await fetchWrapper<IGetSocialResponse>({
      endpoint: `profiles/${username}/following`,
    })

    console.log('-----profilesData', profilesData)

    const walletIds = profilesData?.profiles?.map(
      (profile) => profile.wallet?.id
    )

    // 2. Getting transactions for each wallet

    let allTransactions: IHomeTransaction[] = []

    for (const walletId of walletIds) {
      if (!walletId) continue

      // Getting wallet ids transactions from helius api

      const heliusTransactions = await fetchWrapper<
        IExtendedHeliusTransaction[]
      >({
        endpoint: 'helius-transactions',
        queryParams: {
          walletAddress: walletId,
          limit: 10,
        },
      })

      // Add profile information to each transaction
      const profile = profilesData.profiles.find(
        (profile) => profile.wallet?.id === walletId
      )

      const transactionsWithProfile: IHomeTransaction[] =
        heliusTransactions.map((transaction) => ({
          ...transaction,
          profile,
        }))

      allTransactions.push(...transactionsWithProfile)
    }

    return NextResponse.json(
      allTransactions
        .filter((transaction) => transaction.type === ETransactionType.SWAP)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
    )
  } catch (error) {
    console.error('Error fetching transactions:', error)

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
