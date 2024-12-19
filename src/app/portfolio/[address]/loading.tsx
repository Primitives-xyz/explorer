import Link from 'next/link'

export default function Loading() {
  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto text-green-400 font-mono">
        <Link
          href="/"
          className="inline-block mb-8 text-green-400 hover:text-green-500 transition-all duration-300"
        >
          <h1 className="text-3xl font-mono">Solana Portfolio Viewer</h1>
        </Link>

        <div className="animate-pulse space-y-8 bg-black/50 w-full overflow-hidden">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-64 bg-green-900/20 rounded-lg"></div>
            <div className="h-6 w-96 bg-green-900/20 rounded-lg"></div>
          </div>

          {/* Tab Skeleton */}
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-32 bg-green-900/20 rounded-lg"></div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-black/50 p-6 rounded-lg border border-green-800/30 space-y-4"
              >
                <div className="h-48 bg-green-900/20 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-green-900/20 rounded w-3/4"></div>
                  <div className="h-4 bg-green-900/20 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-green-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
