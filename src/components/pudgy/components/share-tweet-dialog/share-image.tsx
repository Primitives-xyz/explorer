import { Button, ButtonVariant } from '@/components/ui'
import { DownloadIcon } from 'lucide-react'
import Image from 'next/image'

interface Props {
  imageData?: Blob
  isGeneratingImage: boolean
  handleDownloadImage: () => void
}

export function ShareImage({
  imageData,
  isGeneratingImage,
  handleDownloadImage,
}: Props) {
  return (
    <div className="w-[280px] md:w-[350px] aspect-square relative flex items-center justify-center rounded-lg overflow-hidden group shrink-0 bg-muted">
      {!!imageData && (
        <Image
          src={URL.createObjectURL(imageData)}
          alt="Background"
          className="object-cover z-0"
          priority
          fill
        />
      )}
      <Button
        onClick={handleDownloadImage}
        disabled={!imageData || isGeneratingImage}
        variant={ButtonVariant.GHOST}
        className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/20 hover:bg-background/40"
      >
        <DownloadIcon className="w-5 h-5 md:w-6 md:h-6" />
      </Button>
    </div>
  )
}
