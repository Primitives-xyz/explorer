import React from 'react'
import { Copy } from 'lucide-react'

interface Props {
  address: string
  size?: 'sm' | 'lg'
}

export function WalletAddressButton({ address, size = 'sm' }: Props) {
  const handleClick = () => {
    navigator.clipboard.writeText(address)
  }

  const buttonClasses = `font-mono rounded transition-colors flex items-center gap-1 
    bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50 
    ${size === 'lg' ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs'}`

  return (
    <button onClick={handleClick} className={buttonClasses}>
      <Copy size={size === 'lg' ? 16 : 14} />
      {address.slice(0, 4)}...{address.slice(-4)}
    </button>
  )
}
