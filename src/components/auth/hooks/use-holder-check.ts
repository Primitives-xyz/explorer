'use client'

import { useHolderCheck as useHolderContext } from './use-holder-context'

export function useHolderCheck() {
  return useHolderContext()
}
