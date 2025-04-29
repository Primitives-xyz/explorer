import { useQuery } from '@/utils/api/use-query'
import { IHomeTransaction } from '../home-transactions.models'

interface Props {
  username: string
  skip?: boolean
}

export function useGetHomeFollowingTransactions({ username, skip }: Props) {
  const { data, loading, error } = useQuery<IHomeTransaction[]>({
    endpoint: 'home-transactions/following',
    queryParams: {
      username,
    },
    skip,
  })

  return {
    transactions: data,
    loading,
    error,
  }
}
