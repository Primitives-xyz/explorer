import useSWR from 'swr'

async function fetchNamespaceDetails(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch namespace details')
  }
  return await res.json()
}

export interface INamespaceDetails {
  id: number
  name: string
  readableName: string
  faviconURL: string | null
}

export interface INamespaceProfile {
  profile: {
    id: number
    name: string
    displayName: string
    description: string
  }
  wallet: {
    address: string
  }
}

export const useGetNamespaceDetails = ({ name }: { name: string }) => {
  const { data, error, mutate } = useSWR(
    `/api/namespace/${name}`,
    fetchNamespaceDetails
  )

  return {
    namespaceDetails: data?.namespaceDetails as INamespaceDetails,
    isLoading: !error && !data,
    error,
    mutate,
  }
}
