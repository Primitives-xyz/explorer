import { Modal } from '@/components/common/modal'
import { UploadFileEntry } from './upload-file-entry'

interface Props {
  isOpen: boolean
  filesToUpload: File[]
  setIsOpen: (value: boolean) => void
  getUploadUrl: (file: File) => Promise<string>
  onUploadSuccess: (file: File) => void
}

export default function UploadFilesModal({
  isOpen,
  filesToUpload,
  setIsOpen,
  onUploadSuccess,
  getUploadUrl,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={
        filesToUpload?.length > 1
          ? 'Uploading your files'
          : 'Uploading your file'
      }
    >
      <div className="space-y-2">
        {filesToUpload.map((file, index) => (
          <UploadFileEntry
            key={index}
            file={file}
            getUploadUrl={getUploadUrl}
            onUploadSuccess={onUploadSuccess}
          />
        ))}
      </div>
    </Modal>
  )
}
