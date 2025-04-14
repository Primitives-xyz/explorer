import { INamespaceDetails } from '@/components-new-version/models/namespace.models'
import { User } from 'lucide-react'
import Image from 'next/image'

interface Props {
  namespaceDetails: INamespaceDetails | null
}

export async function NamespaceHeader({ namespaceDetails }: Props) {
  return (
    <div className="flex items-center gap-4">
      {namespaceDetails?.faviconURL ? (
        <Image
          src={namespaceDetails?.faviconURL}
          alt="favicon url"
          width={50}
          height={50}
          className="rounded-full aspect-square object-cover"
        />
      ) : (
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <User />
        </div>
      )}
      <span className="flex flex-col">
        <p className="text-xl">{namespaceDetails?.readableName}</p>
        <p className="text-sm text-muted-foreground">
          {namespaceDetails?.userProfileURL}
        </p>
      </span>
    </div>
  )
}
