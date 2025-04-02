import { IProfile } from '@/components-new-version/models/profiles.models'
import { FetchMethod, useMutation } from '@/components-new-version/utils/api'

interface Props {
  username: string
}

export const useUpdateProfile = ({ username }: Props) => {
  const {
    mutate: updateProfile,
    loading,
    error,
    data,
  } = useMutation<null, Partial<IProfile>>({
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
