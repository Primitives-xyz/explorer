import { useQuery } from '@/utils/api'
import { IContent, IGetContentsResponse } from '../models/contents.models'

interface Props {
  namespace: string
  skip?: boolean
}

export const useGetContents = <ContentType = IContent>({
  namespace,
  skip,
}: Props) => {
  const { data, loading, error, refetch } = useQuery<
    IGetContentsResponse<ContentType>
  >({
    endpoint: 'contents',
    queryParams: {
      namespace,
    },
    skip,
  })

  return {
    data,
    loading,
    error,
    refetch,
  }
}
