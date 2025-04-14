'use client'

import { useEffect, useState } from 'react'
import UploadFilesModal from './upload-files-modal'

interface Props {
  getUploadUrl: (file: File) => Promise<string>
  onSuccess: (fils: File[]) => void
}

export function useUploadFiles({ getUploadUrl, onSuccess }: Props) {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const uploadFiles = (files: File[]) => {
    setFilesToUpload(files)
    setModalIsOpen(true)
  }

  const onFileUploadSuccess = (file: File) => {
    setUploadedFiles((prev) => [...prev, file])
  }

  useEffect(() => {
    if (
      uploadedFiles?.length &&
      filesToUpload.length === uploadedFiles.length
    ) {
      setModalIsOpen(false)
      onSuccess(uploadedFiles)
      setFilesToUpload([])
      setUploadedFiles([])
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesToUpload, uploadedFiles])

  return {
    uploadFiles,
    UploadFilesModal: (
      <UploadFilesModal
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
        filesToUpload={filesToUpload}
        onUploadSuccess={onFileUploadSuccess}
        getUploadUrl={getUploadUrl}
      />
    ),
  }
}
