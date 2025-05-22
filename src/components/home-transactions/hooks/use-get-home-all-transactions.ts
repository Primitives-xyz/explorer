import { useQuery } from '@/utils/api/use-query'
import { IHomeTransaction } from '../home-transactions.models'

interface Props {
  skip?: boolean
}

export function useGetHomeAllTransactions({ skip = false }: Props) {
  const { data, loading, error } = useQuery<IHomeTransaction[]>({
    endpoint: 'home-transactions/all',
    skip,
  })

  return {
    transactions: data,
    loading,
    error,
  }
}
