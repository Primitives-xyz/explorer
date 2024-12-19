export default function Loading() {
  return (
    <div className="min-h-[100dvh] w-[100dvw] overflow-x-hidden bg-black text-green-400 font-mono">
      <div className="flex-grow p-4 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Portfolio Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-32 bg-green-900/20 rounded mb-2"></div>
            <div className="h-6 w-96 bg-green-900/20 rounded"></div>
          </div>

          {/* Tab Bar Skeleton */}
          <div className="bg-black/50 w-full overflow-hidden flex flex-col">
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="px-4 py-2 h-9 w-32 bg-green-900/20 rounded"
                ></div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-black/50 p-4 rounded-lg border border-green-800/30 space-y-4"
              >
                <div className="aspect-square w-full bg-green-900/20 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-green-900/20 rounded w-3/4"></div>
                  <div className="h-4 bg-green-900/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
