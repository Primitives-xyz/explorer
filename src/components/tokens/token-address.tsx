'use client'

import { route } from '@/utils/routes'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface TokenAddressProps {
  address: string
}

export const TokenAddress = ({ address }: TokenAddressProps) => {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const truncatedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
  const displayAddress = truncatedAddress

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(route('address', { id: address }))
  }

  return (
    <div className="flex items-center font-mono text-xs gap-0.5">
      <button
        onClick={handleNavigate}
        className="/90 hover: transition-all hover:scale-[1.02] truncate font-medium tracking-wider bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded-md flex items-center gap-1.5 border border-green-500/20 hover:border-green-500/30"
        title={address}
      >
        <span className="/50">→</span>
        {displayAddress}
      </button>
      <button
        onClick={handleCopy}
        className={`px-1.5 py-0.5 text-[10px] transition-colors ${
          copied ? ' bg-green-900/40' : '/70 hover: hover:bg-green-900/20'
        } rounded`}
      >
        {copied ? '[copied!]' : '[copy]'}
      </button>
    </div>
  )
}
