import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useApiVersion() {
  const searchParams = useSearchParams()
  const [useNewApi, setUseNewApi] = useState(() => {
    // First check URL params
    if (typeof window !== 'undefined') {
      const urlParam = searchParams?.get('useNewApi')
      if (urlParam !== null) {
        return urlParam !== 'false'
      }
      // Then fallback to localStorage
      const saved = localStorage.getItem('useNewApi')
      return saved === null ? true : saved === 'true'
    }
    return true
  })

  // Persist to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('useNewApi', useNewApi.toString())
    }
  }, [useNewApi])

  return {
    useNewApi,
    setUseNewApi,
  }
}
