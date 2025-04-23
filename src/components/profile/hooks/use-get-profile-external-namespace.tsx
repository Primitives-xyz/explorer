import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import { IExternalNamespace } from '@/components/tapestry/models/profiles.models'

interface Props {
  walletAddress: string
}

export const useGetProfileExternalNamespaces = ({ walletAddress }: Props) => {
  const { identities, loading } = useGetIdentities({
    walletAddress,
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
    loading,
  }
}
