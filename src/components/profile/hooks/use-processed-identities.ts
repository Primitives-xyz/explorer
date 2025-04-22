import { IGetProfilesResponseEntry } from '@/components/tapestry/models/profiles.models'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { useMemo } from 'react'

export function useProcessedIdentities(
  originalIdentities?: IGetProfilesResponseEntry[]
) {
  return useMemo(() => {
    if (!originalIdentities) {
      return {
        identities: undefined,
        hasXIdentity: false,
        explorerProfile: null,
      }
    }

    const xIdentityIndex = originalIdentities.findIndex(
      (identity) => identity.namespace.name === 'x'
    )

    const explorerIdentityIndex = originalIdentities.findIndex(
      (identity) => identity.namespace.name === EXPLORER_NAMESPACE
    )

    const hasXIdentity = xIdentityIndex !== -1
    const explorerProfile =
      explorerIdentityIndex !== -1
        ? originalIdentities[explorerIdentityIndex]
        : null

    if (!hasXIdentity) {
      return {
        identities: originalIdentities,
        hasXIdentity,
        explorerProfile,
      }
    }

    const xIdentity = originalIdentities[xIdentityIndex]
    const otherIdentities = originalIdentities.filter(
      (_, index) => index !== xIdentityIndex
    )

    return {
      identities: [xIdentity, ...otherIdentities],
      hasXIdentity,
      explorerProfile,
    }
  }, [originalIdentities])
}
