import { useQuery } from '@/components-new-version/utils/api'
import { INFT } from '../profile.models'

export interface Props {
  walletAddress: string
}

export function useMagicEdenNFTs({ walletAddress }: Props) {
  const { data, error, loading, refetch } = useQuery<INFT[]>({
    endpoint: `magiceden/wallet/${walletAddress}`,
  })

  return {
    nfts: data || [],
    loading,
    error,
    refetch,
  }
}
