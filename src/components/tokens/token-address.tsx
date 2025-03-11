'use client'

import { route } from '@/utils/routes'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CopyPaste } from '../common/copy-paste'

interface TokenAddressProps {
  address: string
}

export const TokenAddress = ({ address }: TokenAddressProps) => {
  const router = useRouter()

  const truncatedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
  const displayAddress = truncatedAddress

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(route('address', { id: address }))
  }

  return (
    <div className="flex justify-center items-center font-mono text-xs gap-0.5">
      <button
        onClick={handleNavigate}
        className="/90 hover: transition-all hover:scale-[1.02] truncate font-medium tracking-wider px-1 flex items-center gap-1.5"
      >
        <Image
          src="/images/scan.png"
          alt="scan"
          width={16}
          height={16}
          className="inline-block ml-0.5"
        />
      </button>
      <div
        className="flex items-center gap-1 py-0.5 text-base transition-colors"
      >
        {displayAddress}
        <CopyPaste content={address} />
      </div>
    </div>
  )
}
