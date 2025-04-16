import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'
import { SEARCH_RESULTS_LIMIT } from '../components/search-button'

interface Props {
  query: string
}

export function useGetSearchProfiles({ query = '' }: Props) {
  const { data, loading, error } = useQuery<IGetProfilesResponse>({
    endpoint: 'search',
    queryParams: {
      query,
      pageSize: SEARCH_RESULTS_LIMIT,
    },
    skip: query.length <= 2,
  })

  return {
    profiles: data?.profiles ?? [],
    loading,
    error,
  }
}
