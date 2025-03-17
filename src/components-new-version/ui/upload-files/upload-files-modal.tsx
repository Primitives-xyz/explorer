import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../dialog/dialog'
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent isStatic hideCloseButton>
        <DialogHeader>
          <DialogTitle className="loading-dots">
            {filesToUpload?.length > 1
              ? 'Uploading your files'
              : 'Uploading your file'}
          </DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  )
}
