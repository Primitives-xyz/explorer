'use client'

import { useCallback, useState } from 'react'
import { useUploadFiles } from './use-upload-avatar'
import { useToast } from '@/hooks/use-toast'

export function TestUpload() {
  const { toast } = useToast()
  const [_selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const getUploadUrl = useCallback(
    async (file: File) => {
      if (isUploading) return
      setIsUploading(true)
      try {
        const response = await fetch(
          `/api/upload/${encodeURIComponent(file.name)}`,
          {
            method: 'POST',
          },
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to get upload URL')
        }

        const data = await response.json()
        return data.postUrl
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to get upload URL',
          variant: 'error',
          duration: 5000,
        })
        throw error
      } finally {
        setIsUploading(false)
      }
    },
    [toast, isUploading],
  )

  const onSuccess = useCallback(
    (files: File[]) => {
      toast({
        title: 'Upload Complete',
        description: `Successfully uploaded ${files.length} file(s)`,
        variant: 'success',
        duration: 5000,
      })
      setSelectedFiles([])
    },
    [toast],
  )

  const { uploadFiles, UploadFilesModal } = useUploadFiles({
    getUploadUrl,
    onSuccess,
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
    uploadFiles(files)
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFileSelect}
        multiple
        disabled={isUploading}
        className="block w-full text-sm text-green-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-green-900/30 file:text-green-400
          hover:file:bg-green-900/50
          file:cursor-pointer file:transition-colors
          file:border file:border-green-500
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {UploadFilesModal}
    </div>
  )
}
