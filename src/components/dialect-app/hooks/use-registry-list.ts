import { useEffect, useState } from 'react'

interface RegistryV1Item {
  actionUrl: string
  blinkUrl: string | null
  websiteUrl: string | null
  createdAt: string
  tags: string[]
}

interface UseRegistryListProps {
  appName: string
}

const useRegistryList = ({ appName }: UseRegistryListProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registryList, setRegistryList] = useState<RegistryV1Item[]>([])
  const [websites, setWebsites] = useState<string[]>([])

  const fetchRegistryList = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/dialect/registry-list?app_name=${appName}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch registry list')
      }
      const data = await response.json()
      setWebsites(data.websites)
      setRegistryList(data.registryV1)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistryList()
  }, [appName])

  return {
    registryList,
    loading,
    error,
    websites,
  }
}

export default useRegistryList
