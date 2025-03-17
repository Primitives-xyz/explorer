// Shimmer loading effect component
export function ShimmerEffect() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-green-900/20 rounded w-32 animate-pulse"></div>
        <div className="flex gap-3">
          <div className="h-8 bg-green-900/20 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-green-900/20 rounded w-32 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden border border-green-800/30 bg-black/80"
          >
            <div className="aspect-square bg-gradient-to-br from-green-900/30 to-green-800/20 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-500/20 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L13.5099 16M14.1666 11.5C14.1666 11.5 15.5 10.5 16.5 10.5C17.5 10.5 18.8333 11.5 18.8333 11.5M6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25Z"
                ></path>
              </svg>
            </div>
            <div className="p-3 space-y-3">
              <div className="h-5 bg-green-900/30 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-green-900/20 rounded w-1/2 animate-pulse"></div>
              <div className="flex gap-1 pt-1">
                <div className="h-4 bg-green-900/20 rounded-full w-16 animate-pulse"></div>
                <div className="h-4 bg-green-900/20 rounded-full w-14 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
