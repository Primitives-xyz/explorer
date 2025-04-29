import { useQuery } from '@/utils/api/use-query'
import { IHomeTransaction } from '../home-transactions.models'

interface Props {
  skip?: boolean
}

export function useGetHomeFollowingTransactions({ skip }: Props) {
  const { data, loading, error } = useQuery<IHomeTransaction[]>({
    endpoint: 'home-transactions/following',
    skip,
  })

  return {
    transactions: data,
    loading,
    error,
  }
}
