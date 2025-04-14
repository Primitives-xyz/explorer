import { IGetProfilesResponse } from '@/components/models/profiles.models'
import { useQuery } from '@/components/utils/api'
import { X_NAMESPACE } from '@/components/utils/constants'
import { useValidateWallet } from '@/components/utils/use-validate-wallet'

interface Props {
  walletAddress: string
  namespace?: string
}

export const useGetIdentities = ({
  walletAddress,
  namespace = X_NAMESPACE,
}: Props) => {
  const { isValid } = useValidateWallet({
    walletAddress,
    namespace,
  })

  const { data, loading, error, refetch } = useQuery<IGetProfilesResponse>({
    endpoint: 'identities',
    queryParams: {
      walletAddress,
      ...(namespace === X_NAMESPACE && {
        contactType: 'TWITTER',
        useIdentities: true,
      }),
    },
    skip: !isValid,
  })

  return {
    identities: data?.profiles,
    loading,
    error,
    refetch,
  }
}
