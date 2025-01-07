import useSWR, { mutate } from 'swr'

export const useGetProfiles = (walletAddress: string) => {
  const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to fetch profiles')
    }
    const data = await res.json()
    return data.profiles
  }

  const key = walletAddress
    ? `/api/profiles?walletAddress=${walletAddress}`
    : null

  const {
    data: profiles,
    error,
    isLoading,
    mutate: mutateProfiles,
  } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
    revalidateIfStale: true,
    revalidateOnMount: true,
    refreshInterval: 0,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    keepPreviousData: true,
    fallbackData: null,
    isPaused: () => !walletAddress,
  })

  return { profiles, loading: isLoading, error, mutateProfiles }
}

// Export a function to manually trigger revalidation
export const refreshProfiles = (walletAddress: string) => {
  return mutate(`/api/profiles?walletAddress=${walletAddress}`)
}
