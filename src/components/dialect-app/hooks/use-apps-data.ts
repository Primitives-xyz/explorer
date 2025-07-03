import { useState, useEffect } from 'react'

interface AppData {
  commonName: string
  method: string
  state: string
  favicon?: string
  lastUpdated: string
}

interface AppsResponse {
  apps: Record<string, AppData>
  groupedByCommonName: Record<string, string[]>
}

export function useAppsData() {
  const [data, setData] = useState<AppsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAppsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dialect/apps')
      
      if (!response.ok) {
        throw new Error('Failed to fetch apps data')
      }
      
      const result: AppsResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchAppsData()
  }

  useEffect(() => {
    fetchAppsData()
  }, [])

  // Helper functions for data analysis
  const getStats = () => {
    if (!data) return null

    const totalApps = Object.keys(data.apps).length
    const uniqueCommonNames = Object.keys(data.groupedByCommonName).length
    const trustedApps = Object.values(data.apps).filter(app => app.state === 'trusted').length
    const untrustedApps = totalApps - trustedApps

    return {
      totalApps,
      uniqueCommonNames,
      trustedApps,
      untrustedApps
    }
  }

  const getAppsByState = (state: string) => {
    if (!data) return []
    
    return Object.entries(data.apps)
      .filter(([_, app]) => app.state === state)
      .map(([key, app]) => ({ key, ...app }))
  }

  const getAppsByMethod = (method: string) => {
    if (!data) return []
    
    return Object.entries(data.apps)
      .filter(([_, app]) => app.method === method)
      .map(([key, app]) => ({ key, ...app }))
  }

  return {
    data,
    loading,
    error,
    refreshData,
    getStats,
    getAppsByState,
    getAppsByMethod
  }
} 