import { useMemo } from 'react'
import { X_NAMESPACE } from './constants'
import { isValidSolanaAddress } from './validation'

interface Props {
  walletAddress: string
  namespace?: string
}

export function useValidateWallet({ walletAddress, namespace }: Props) {
  const isValid = useMemo(() => {
    if (namespace === X_NAMESPACE) {
      return true
    } else {
      return !!walletAddress && isValidSolanaAddress(walletAddress)
    }
  }, [namespace, walletAddress])

  return {
    isValid,
  }
}
