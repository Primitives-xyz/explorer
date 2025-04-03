import { IFindOrCreateProfileInput } from '@/components-new-version/models/profiles.models'
import { useMutation } from '@/components-new-version/utils/api'

export const useCreateProfile = <T = IFindOrCreateProfileInput>() => {
  const {
    mutate: createProfile,
    loading,
    error,
    data,
  } = useMutation<null, T>({
    endpoint: 'profiles/create',
  })

  return {
    createProfile,
    loading,
    error,
    data,
  }
}
