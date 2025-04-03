import { IGetProfilesResponse } from '@/components-new-version/models/profiles.models'
import { useQuery } from '@/components-new-version/utils/api'
import { X_NAMESPACE } from '@/components-new-version/utils/constants'
import { isValidSolanaAddress } from '@/components-new-version/utils/validation'

interface Props {
  walletAddress: string
  namespace?: string
}

export const useGetIdentities = ({
  walletAddress,
  namespace = X_NAMESPACE,
}: Props) => {
  const isInvalidWalletAddress =
    namespace !== X_NAMESPACE &&
    !!walletAddress &&
    !isValidSolanaAddress(walletAddress)

  if (isInvalidWalletAddress) {
    throw new Error('Invalid Solana wallet address')
  }

  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: 'identities',
    queryParams: {
      walletAddress,
      ...(namespace === X_NAMESPACE && {
        contactType: 'TWITTER',
        useIdentities: true,
      }),
    },
    skip: isInvalidWalletAddress,
  })

  return {
    identities: data?.profiles,
    loading,
    error,
    refetch,
  }
}
