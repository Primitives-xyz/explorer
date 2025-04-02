import { PublicKey } from '@solana/web3.js'

export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 32-44 characters long
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
  return (
    base58Regex.test(address) && address.length >= 32 && address.length <= 44
  )
}

export function isValidTransactionSignature(signature: string): boolean {
  // Solana transaction signatures are base58 encoded and typically 87-88 characters long
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
  return (
    base58Regex.test(signature) &&
    (signature.length === 88 || signature.length === 87)
  )
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

export function isValidPublicKey(value: string): boolean {
  try {
    new PublicKey(value)
    return true
  } catch {
    return false
  }
}
/**
 * Determines the type of route based on the ID format
 */
export function determineRouteType(id: string): RouteType {
  const cleanId = id.startsWith('@') ? id.slice(1) : id

  if (isValidTransactionSignature(cleanId)) {
    return 'transaction'
  }
  if (isValidPublicKey(cleanId)) {
    return 'token'
  }
  return 'profile'
}

export type RouteType = 'transaction' | 'token' | 'profile'

// Types
export type IdParams = Promise<{ id: string }>

export type NamespaceParams = Promise<{ namespace: string }>
