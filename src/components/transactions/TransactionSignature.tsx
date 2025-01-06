import { useRouter } from 'next/navigation'

interface TransactionSignatureProps {
  signature: string
}

export const TransactionSignature = ({
  signature,
}: TransactionSignatureProps) => {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-green-400 hover:text-green-300 font-mono cursor-pointer text-sm transition-colors duration-200 border border-green-800/50 rounded px-2 py-0.5 hover:border-green-700"
        onClick={() => router.push(`/${signature}`)}
        title="Click to view transaction details"
      >
        {signature}
      </span>
      <a
        href={`https://solscan.io/tx/${signature}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-600 hover:text-green-500 font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        View
      </a>
    </div>
  )
}
