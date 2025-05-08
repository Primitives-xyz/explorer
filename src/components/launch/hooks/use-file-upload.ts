import { useState } from 'react'
import { useUploadFiles } from '@/components/ui'
import { createURL, FetchMethod, fetchWrapper } from '@/utils/api'

export function useFileUpload(onUploadSuccess: (imageUrl: string) => void) {
  const [uploadLoading, setUploadLoading] = useState(false)

  const { uploadFiles, UploadFilesModal } = useUploadFiles({
    getUploadUrl: async (file: File) => {
      const response = await fetchWrapper<{ postUrl: string }>({
        method: FetchMethod.POST,
        endpoint: `upload/${file.name}`,
      })
      return response.postUrl
    },
    onSuccess: async (files: File[]) => {
      if (!process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL) {
        console.error('Missing env var NEXT_PUBLIC_TAPESTRY_ASSETS_URL')
        setUploadLoading(false)
        return
      }

      const filename = files[0]?.name
      const imageUrl = createURL({
        domain: process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL,
        endpoint: filename,
      })

      onUploadSuccess(imageUrl)
      setUploadLoading(false)
    },
  })

  const onFileChange = (file: File) => {
    setUploadLoading(true)
    uploadFiles([file])
  }

  return {
    uploadLoading,
    onFileChange,
    UploadFilesModal
  }
} 