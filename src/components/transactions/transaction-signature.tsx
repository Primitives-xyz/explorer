'use client'

interface TransactionSignatureProps {
  signature: string
}

export function TransactionSignature({ signature }: TransactionSignatureProps) {
  return (
    <div className="font-mono text-sm text-gray-400">
      {signature}
    </div>
  )
} 