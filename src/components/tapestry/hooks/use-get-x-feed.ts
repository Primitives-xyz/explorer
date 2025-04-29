import { ITwitterFeed } from '@/components/tapestry/models/twitter.models'
import { useQuery } from '@/utils/api'

interface Props {
  xUsername: string
}

export const useGetXFeed = ({ xUsername }: Props) => {
  const { data, error, loading, refetch } = useQuery<ITwitterFeed>({
    endpoint: 'x/feed',
    queryParams: {
      handle: xUsername,
    },
  })

  return {
    data,
    loading,
    error,
    refetch,
  }
}
