'use client'

import { useEffect, useState } from 'react'
import { useIsMobile as useIsMobileClient } from './use-is-mobile'

interface UseIsMobileSSROptions {
  breakpoint?: string
  defaultValue?: boolean
}

/**
 * SSR-safe version of useIsMobile hook
 * Returns defaultValue (false by default) during SSR and hydration,
 * then updates to actual value after mount
 */
export function useIsMobileSSR(options?: UseIsMobileSSROptions) {
  const defaultValue = options?.defaultValue ?? false
  const clientValues = useIsMobileClient({ breakpoint: options?.breakpoint })

  // Start with default values to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return default values during SSR and initial hydration
  if (!mounted) {
    return {
      isMobile: defaultValue,
      isTablet: false,
      isDesktop: !defaultValue,
      isSmallScreen: defaultValue,
      isMediumScreen: false,
      isLargeScreen: false,
    }
  }

  // Return actual values after mount
  return clientValues
}
