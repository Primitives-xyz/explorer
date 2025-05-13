import { useQuery } from '@/utils/api'
import { IHomeTransaction } from '../home-transactions.models'

export function useGetHomeKolTransactions() {
  const { data, loading, error } = useQuery<IHomeTransaction[]>({
    endpoint: 'home-transactions/kol',
    config: {
      dedupingInterval: 10000, // 10 seconds
      revalidateOnFocus: false, // Prevent extra calls when user tabs back
    },
  })
  // const { data, loading, onLoadMore, error } =
  //   usePaginatedQuery<IHomeTransaction>({
  //     endpoint: 'home-transactions/kol',
  //     queryParams: {
  //       lastTransactions: data?.map(transaction => {
  //         walletId: transaction.walletId,
  //         signature: transaction.signature,
  //       }),
  //     },
  //   })

  return {
    transactions: data,
    loading,
    error,
    // onLoadMore,
  }
}
