import { ITokenBalanceResponse } from '@/components/models/token.models'
import { useQuery } from '@/components/utils/api'
import { SSE_TOKEN_MINT } from '@/components/utils/constants'
import { formatNumber } from '@/components/utils/utils'

interface Props {
  walletAddress: string
}

export const useGetBalance = ({ walletAddress }: Props) => {
  const { data, loading, error, refetch } = useQuery<ITokenBalanceResponse>({
    endpoint: 'tokens/balance',
    queryParams: {
      walletAddress,
      mintAddress: SSE_TOKEN_MINT,
    },
    skip: !walletAddress,
    config: { refreshInterval: 60000 },
  })

  return {
    balance: formatNumber(Number(data?.balance.uiAmountString)),
    loading,
    error,
    refetch,
  }
}
