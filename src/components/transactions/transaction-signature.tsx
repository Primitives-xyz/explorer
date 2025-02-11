import { getSolscanTxUrl } from '@/lib/constants'
import { ExternalLinkIcon } from 'lucide-react'

interface TransactionSignatureProps {
  signature: string
}

export function TransactionSignature({ signature }: TransactionSignatureProps) {
  return (
    <a
      href={getSolscanTxUrl(signature)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
    >
      <span className="font-mono">
        {signature.slice(0, 4)}...{signature.slice(-4)}
      </span>
      <ExternalLinkIcon className="w-3 h-3" />
    </a>
  )
}
