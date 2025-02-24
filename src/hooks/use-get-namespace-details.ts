import useSWR from 'swr'

async function fetchNamespaceDetails(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch namespace details')
  }
  return await res.json()
}

export const useGetNamespaceDetails = ({ name }: { name: string }) => {
  const { data, error, mutate } = useSWR(
    `/api/namespace/${name}`,
    fetchNamespaceDetails
  )

  return {
    namespaceDetails: data?.namespaceDetails,
    isLoading: !error && !data,
    error,
    mutate,
  }
}
