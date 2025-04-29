import {
  ETransactionType,
  IExtendedHeliusTransaction,
  IHomeTransaction,
} from '@/components/home-transactions/home-transactions.models'
import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import { fetchWrapper } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 1. Get all profiles in kolscan namespace
    // Getting only first page of profiles for now

    const profilesData = await fetchWrapper<IGetProfilesResponse>({
      endpoint: 'profiles',
      queryParams: {
        namespace: 'kolscan',
      },
    })

    const walletIds = profilesData?.profiles?.map(
      (profile) => profile.wallet?.address
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
          limit: 4,
        },
      })

      // Add profile information to each transaction
      const profile = profilesData.profiles.find(
        (profile) => profile.wallet?.address === walletId
      )

      const transactionsWithProfile: IHomeTransaction[] =
        heliusTransactions.map((transaction) => ({
          ...transaction,
          profile: profile?.profile,
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
