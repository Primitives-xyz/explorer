import { useQuery } from '@/components-new-version/utils/api'
import { INft } from '../magic-eden-nfts.models'

export interface Props {
  walletAddress: string
}

export function useMagicEdenNFTs({ walletAddress }: Props) {
  const { data, error, loading, refetch } = useQuery<INft[]>({
    endpoint: `magiceden/wallet/${walletAddress}`,
  })

  return {
    nfts: data || [],
    loading,
    error,
    refetch,
  }
}
