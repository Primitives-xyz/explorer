'use client'

import { useEffect } from 'react'
import { useUploadMedia } from './use-upload-media'
import { Progress } from './progress'

interface Props {
  file: File
  getUploadUrl: (file: File) => Promise<string>
  onUploadSuccess: (file: File) => void
}

export function UploadFileEntry({
  file,
  onUploadSuccess,
  getUploadUrl,
}: Props) {
  const { uploadMedia, uploadProgress } = useUploadMedia({
    getUploadUrl,
    onUploadSuccess,
  })

  useEffect(() => {
    uploadMedia(file)
  }, [file, uploadMedia])

  return (
    <div className="bg-black/40 border border-green-500/20 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-green-400 font-mono truncate">
          {file.name}
        </div>
        <div className="text-xs text-green-600 font-mono">
          {Math.round(uploadProgress)}%
        </div>
      </div>
      <Progress value={uploadProgress} className="h-2" />
    </div>
  )
}
