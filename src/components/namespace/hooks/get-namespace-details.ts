import { INamespaceDetails } from '@/components/models/namespace.models'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'

interface Props {
  name: string
}

export async function getNamespaceDetails({
  name,
}: Props): Promise<{ namespaceDetails: INamespaceDetails | null }> {
  try {
    const data = await fetchTapestryServer({
      endpoint: `namespace/${name}`,
    })

    return { namespaceDetails: data }
  } catch (error) {
    console.error('[getNamespaceDetails Error]:', error)
    return { namespaceDetails: null }
  }
}
