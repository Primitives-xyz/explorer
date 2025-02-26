import { INamespaceDetails } from '@/hooks/use-get-namespace-details'
import { fetchTapestryServer } from '@/lib/tapestry-server'

export async function getNamespaceDetails(
  name: string
): Promise<INamespaceDetails | null> {
  try {
    const data = await fetchTapestryServer({
      endpoint: `namespace/${name}`,
    })

    return data
  } catch (error) {
    console.error('[getNamespaceDetails Error]:', error)
    return null
  }
}

export async function getNamespaceProfiles(name: string) {
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
