import useSWR from 'swr'

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

  const {
    data: profiles,
    error,
    isLoading,
  } = useSWR(
    walletAddress ? `/api/profiles?walletAddress=${walletAddress}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2000,
      revalidateIfStale: false,
      revalidateOnMount: true,
      refreshInterval: 0,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      focusThrottleInterval: 60000,
    },
  )

  return { profiles, loading: isLoading, error }
}
