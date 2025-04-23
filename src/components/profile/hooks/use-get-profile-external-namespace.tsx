import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import { IExternalNamespace } from '@/components/tapestry/models/profiles.models'
import { useProcessedIdentities } from './use-processed-identities'

interface Props {
  walletAddress: string
}

export const useGetProfileExternalNamespaces = ({ walletAddress }: Props) => {
  const { identities: originalIdentities, loading } = useGetIdentities({
    walletAddress,
  })
  const { identities, hasXIdentity, explorerProfile } = useProcessedIdentities({
    originalIdentities,
  })

  let namespaces: IExternalNamespace[] = []

  identities?.forEach((identity) => {
    const socialEntry = namespaces.find(
      (entry) => entry.namespace.name === identity.namespace.name
    )

    if (!!socialEntry) {
      socialEntry.profiles.push(identity)
    } else {
      namespaces.push({
        namespace: identity.namespace,
        profiles: [identity],
      })
    }
  })

  return {
    namespaces,
    hasXIdentity,
    explorerProfile,
    loading,
  }
}
