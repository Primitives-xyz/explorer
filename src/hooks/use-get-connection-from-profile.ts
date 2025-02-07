import useSWR from 'swr'

export interface NodeWithLabels {
  id: string
  caption: string
  labels: string[]
}

export interface Relationship {
  id: string
  from: string
  to: string
  type: string
}

interface GetConnectionsResponse {
  nodes: NodeWithLabels[]
  rels: Relationship[]
}

async function fetchConnections(url: string): Promise<GetConnectionsResponse> {
  const res = await fetch(url)

  if (!res.ok) {
    let errorMessage = 'Failed to fetch connections'
    try {
      const errorData = await res.json()
      errorMessage = errorData.error || errorMessage
    } catch (e) {
      console.error('Error parsing error response:', e)
    }
    throw new Error(errorMessage)
  }

  return res.json()
}

export function useGetConnectionFromProfile(username: string | null) {
  const url = username ? `/api/get-connection-from-profile/${username}` : null

  const { data, error, mutate, isLoading } = useSWR<GetConnectionsResponse>(
    url,
    url ? () => fetchConnections(url) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      revalidateIfStale: true,
      refreshInterval: 0,
      dedupingInterval: 0,
      fallbackData: { nodes: [], rels: [] },
    },
  )

  return {
    data,
    nodes: data?.nodes || [],
    relationships: data?.rels || [],
    loading: isLoading,
    error,
    mutate,
  }
}
