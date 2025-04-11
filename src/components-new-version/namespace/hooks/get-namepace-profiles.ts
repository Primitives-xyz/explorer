import { INamespaceProfile } from '@/components-new-version/models/namespace.models'
import { fetchTapestryServer } from '@/components-new-version/utils/api/tapestry-server'

interface Props {
  name: string
}

export async function getNamespaceProfiles({ name }: Props): Promise<{
  profiles: INamespaceProfile[]
  totalCount: number
}> {
  try {
    const data = await fetchTapestryServer({
      endpoint: `profiles?namespace=${name}`,
    })

    return {
      profiles: data.profiles || [],
      totalCount: data.totalCount || 0,
    }
  } catch (error) {
    console.error('[getNamespaceProfiles Error]:', error)
    return {
      profiles: [],
      totalCount: 0,
    }
  }
}
