'use client'

import { CheckIcon, ClipboardIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

interface TransactionLinkProps {
  signature: string
  onDismiss: (signature: string) => void
}

export function TransactionLink({
  signature,
  onDismiss,
}: TransactionLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(signature)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shortSignature = `${signature.slice(0, 4)}...${signature.slice(-4)}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  const txUrl = `${appUrl}/${signature}`

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 bg-card/50 border border-foreground/10 rounded-card animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2 flex-1">
        <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" />
        <a
          href={txUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary/80 hover:text-primary transition-colors truncate"
        >
          Transaction {shortSignature}
        </a>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-accent rounded-button transition-colors"
          title="Copy signature"
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-primary" />
          ) : (
            <ClipboardIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <button
          onClick={() => onDismiss(signature)}
          className="p-1.5 hover:bg-accent rounded-button transition-colors"
          title="Dismiss"
        >
          <XMarkIcon className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      </div>
    </div>
  )
}
