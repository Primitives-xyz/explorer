import { createURL } from '@/lib/utils'
import { useState } from 'react'

interface UseFileUploadReturn {
  fileUrl: string
  isUploading: boolean
  error: string | null
  uploadFile: (file: File) => Promise<string>
}

export function useFileUpload(): UseFileUploadReturn {
  const [fileUrl, setFileUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File): Promise<string> => {
    try {
      setIsUploading(true)
      setError(null)

      const endpoint = `/api/upload/${encodeURIComponent(file.name)}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get upload URL')
      }

      if (!data.postUrl) {
        throw new Error('No upload URL returned from server')
      }

      // Upload the file
      const uploadResponse = await fetch(data.postUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        const uploadErrorText = await uploadResponse
          .text()
          .catch(() => 'No error text available')
        throw new Error(`Failed to upload image: ${uploadErrorText}`)
      }

      // Extract the path from the pre-signed URL
      const url = new URL(data.postUrl)
      const filePath = url.pathname.split('?')[0] // Remove query parameters

      // Construct the final file URL
      const finalFileUrl = createURL({
        domain: process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL || '',
        endpoint: filePath || '',
      })

      setFileUrl(finalFileUrl)
      return finalFileUrl
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return {
    fileUrl,
    isUploading,
    error,
    uploadFile,
  }
}
