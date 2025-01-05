'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface TokenAddressProps {
  address: string
  showFull?: boolean
}

export const TokenAddress = ({
  address,
  showFull = false,
}: TokenAddressProps) => {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const truncatedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
  const displayAddress = showFull ? address : truncatedAddress

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/${address}`)
  }

  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <button
        onClick={handleNavigate}
        className="text-green-400 hover:text-green-300 transition-colors truncate"
        title={address}
      >
        {displayAddress}
      </button>
      <button
        onClick={handleCopy}
        className={`px-2 py-0.5 text-xs transition-colors ${
          copied
            ? 'text-green-400 bg-green-900/40'
            : 'text-green-600 hover:text-green-400 hover:bg-green-900/20'
        } rounded`}
      >
        {copied ? '[copied!]' : '[copy]'}
      </button>
    </div>
  )
}
