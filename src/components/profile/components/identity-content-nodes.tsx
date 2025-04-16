import { useGetContents } from '@/components/tapestry/hooks/use-get-contents'
import { IGetProfilesResponseEntry } from '@/components/tapestry/models/profiles.models'

interface Props {
  identity: IGetProfilesResponseEntry
}

export function IdentityContentNodes({ identity }: Props) {
  const { data } = useGetContents({
    namespace: identity.namespace.name,
  })

  return <div></div>
}
