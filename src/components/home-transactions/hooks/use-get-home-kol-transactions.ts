import { useQuery } from '@/utils/api/use-query'
import { IHomeTransaction } from '../home-transactions.models'

export function useGetHomeKolTransactions() {
  const { data, loading, error } = useQuery<IHomeTransaction[]>({
    endpoint: 'home-transactions/kol',
  })

  return {
    transactions: data,
    loading,
    error,
  }
}
