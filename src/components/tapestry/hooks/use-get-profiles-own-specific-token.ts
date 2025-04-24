import { IGetProfileOwnSpecificToken } from '@/components/tapestry/models/token.models'
import { useQuery } from '@/utils/api'

interface Props {
  tokenAddress: string
}

export const useGetProfilesOwnSpecificToken = ({ tokenAddress }: Props) => {
  const { data, loading, error, refetch } =
    useQuery<IGetProfileOwnSpecificToken>({
      endpoint: `tokens/${tokenAddress}/holders`,
    })

  return {
    data,
    loading,
    error,
    refetch,
  }
}
