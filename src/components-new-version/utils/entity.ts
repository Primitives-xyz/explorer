import {
  isValidPublicKey,
  isValidTransactionSignature,
} from '@/components-new-version/utils/validation'

export enum RouteType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  PROFILE = 'profile',
}

export function determineRouteType(id: string): RouteType {
  const cleanId = id.startsWith('@') ? id.slice(1) : id

  if (isValidTransactionSignature(cleanId)) {
    return RouteType.TRANSACTION
  }

  if (isValidPublicKey(cleanId)) {
    return RouteType.TOKEN
  }

  return RouteType.PROFILE
}
