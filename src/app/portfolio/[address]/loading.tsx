import Link from 'next/link'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-8 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <h1 className="text-3xl font-bold">Solana Portfolio Viewer</h1>
        </Link>

        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
            <div className="h-6 w-96 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Tab Skeleton */}
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-md space-y-4"
              >
                <div className="h-12 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
