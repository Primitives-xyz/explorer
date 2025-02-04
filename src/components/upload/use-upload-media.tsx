import { useCallback, useState } from 'react'

interface Props {
  getUploadUrl: (file: File) => Promise<string>
  onUploadSuccess: (file: File) => void
}
export const createURL = ({
  domain,
  endpoint,
}: {
  domain: string
  endpoint: string
}) => {
  domain = domain.replace(/\/+$/, '')
  endpoint = endpoint.replace(/^\/+|\/+$/g, '')

  if (!domain) {
    return endpoint
  }

  return domain + '/' + endpoint
}

export function useUploadMedia({ getUploadUrl, onUploadSuccess }: Props) {
  const [uploadProgress, setUploadProgress] = useState(0)

  function resetUploadMedia() {
    setUploadProgress(0)
  }

  const uploadToS3 = useCallback(
    (file: File, postUrl: string) => {
      const request = new XMLHttpRequest()
      request.open('PUT', postUrl)

      request.upload.addEventListener('progress', (event) => {
        setUploadProgress((event.loaded / event.total) * 100)
      })

      request.addEventListener('load', () => {
        if (request.status === 200) {
          onUploadSuccess(file)
        }
      })

      request.send(file)
    },
    [onUploadSuccess],
  )

  const uploadMedia = useCallback(
    async (file: File) => {
      const postUrl = await getUploadUrl(file)
      uploadToS3(file, postUrl)
    },
    [uploadToS3, getUploadUrl],
  )

  return {
    uploadProgress,
    uploadMedia,
    resetUploadMedia,
  }
}
