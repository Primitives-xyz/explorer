import { useEffect } from 'react'
import { Progress } from '../progress'
import { useUploadMedia } from './use-upload-media'

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  return <Progress value={uploadProgress} />
}
