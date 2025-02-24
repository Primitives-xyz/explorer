import useSWR from 'swr'

async function fetchNamespaceProfiles(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch namespace profiles')
  }
  return await res.json()
}

export const useGetNamespaceProfiles = ({ name }: { name: string }) => {
  const { data, error, mutate } = useSWR(
    `/api/profiles?namespace=${name}`,
    fetchNamespaceProfiles
  )

  console.log('[data profiles]', JSON.stringify(data, null, 2))

  return {
    profiles: data?.profiles,
    totalCount: data?.totalCount,
    isLoading: !error && !data,
    error,
    mutate,
  }
}
