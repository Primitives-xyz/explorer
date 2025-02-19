'use client'

import { useWallet } from '../wallet-context'

export function useCurrentWallet() {
  return useWallet()
}
