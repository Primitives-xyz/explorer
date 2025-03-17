'use client'

interface NFTLoadingErrorProps {
  error: string
}

export function NFTLoadingError({ error }: NFTLoadingErrorProps) {
  return (
    <div className="p-6 border border-red-800/50 bg-red-900/20 text-red-400 rounded-lg flex flex-col items-center">
      <svg
        className="w-12 h-12 text-red-500/70 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="font-medium text-lg mb-1">Error loading NFTs</p>
      <p className="text-sm text-center max-w-md">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-red-900/30 hover:bg-red-800/40 border border-red-800/50 rounded-md text-sm transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
