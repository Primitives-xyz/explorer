import { ITokenBalanceResponse } from '@/components/tapestry/models/token.models'
import { useQuery } from '@/utils/api'
import { SSE_TOKEN_MINT } from '@/utils/constants'
import { formatNumber } from '@/utils/utils'

interface Props {
  walletAddress: string
  skip?: boolean
}

export const useGetBalance = ({ walletAddress, skip }: Props) => {
  const { data, loading, error, refetch } = useQuery<ITokenBalanceResponse>({
    endpoint: 'tokens/balance',
    queryParams: {
      walletAddress,
      mintAddress: SSE_TOKEN_MINT,
    },
    skip: !walletAddress || skip,
    config: {
      refreshInterval: 120000,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    },
  })

  return {
    balance: formatNumber(Number(data?.balance.uiAmountString)),
    loading,
    error,
    refetch,
  }
}
