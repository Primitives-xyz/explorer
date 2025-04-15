import { useQuery } from '@/utils/api'
import { useValidateWallet } from '@/utils/use-validate-wallet'
import { IGetProfilePortfolioResponse } from '../birdeye-portfolio.models'

interface Props {
  walletAddress: string
}

export function useGetProfilePortfolio({ walletAddress }: Props) {
  const { isValid } = useValidateWallet({
    walletAddress,
  })

  const { data, loading, error } = useQuery<IGetProfilePortfolioResponse>({
    endpoint: 'https://public-api.birdeye.so/v1/wallet/token_list',
    queryParams: {
      wallet: walletAddress,
    },
    headers: {
      'x-chain': 'solana',
      'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY!,
    },
    toBackend: false,
    skip: !isValid,
  })

  return {
    data,
    loading,
    error,
  }
}
