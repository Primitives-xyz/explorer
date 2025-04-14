import { IUpdateContentInput } from '@/components/models/contents.models'
import { IProfile } from '@/components/models/profiles.models'
import { FetchMethod, useMutation } from '@/utils/api'

interface Props {
  username: string
}

export const useUpdateProfile = ({ username }: Props) => {
  const {
    mutate: updateProfile,
    loading,
    error,
    data,
  } = useMutation<null, Partial<IProfile> & IUpdateContentInput>({
    endpoint: `profiles/${username}`,
    method: FetchMethod.PUT,
  })

  return {
    updateProfile,
    loading,
    error,
    data,
  }
}
