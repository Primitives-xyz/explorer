import { ITokenBalanceResponse } from '@/components-new-version/models/token.models'
import { useQuery } from '@/components-new-version/utils/api'
import { SSE_TOKEN_MINT } from '@/components-new-version/utils/constants'
import { formatNumber } from '@/components-new-version/utils/utils'

interface Props {
  walletAddress: string
}

export const useTokenBalance = ({ walletAddress }: Props) => {
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
