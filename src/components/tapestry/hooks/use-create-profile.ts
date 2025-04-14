import { IFindOrCreateProfileInput } from '@/components/models/profiles.models'
import { useMutation } from '@/components/utils/api'

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
