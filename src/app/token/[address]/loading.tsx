import { Skeleton } from '@/components/ui/skeleton'

export default function TokenDetailsLoading() {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="container mx-auto px-2 md:px-8 py-8">
        {/* Hero Section Loading State */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent blur-3xl" />
          <div className="relative flex flex-col p-8 bg-black/40 border border-green-800 rounded-2xl backdrop-blur-sm">
            {/* Token Identity Loading */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <Skeleton className="w-32 h-32 rounded-2xl" />
              <div className="flex-1 w-full space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <Skeleton className="h-10 w-64" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full max-w-2xl" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>

            {/* Metrics Loading */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Swap Section Loading */}
          <div className="flex flex-col">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>

          {/* Token Details Loading */}
          <div className="flex flex-col">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>

        {/* Chart and History Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Loading */}
          <div className="lg:col-span-2">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-[600px] rounded-xl" />
          </div>

          {/* Transaction History Loading */}
          <div>
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-[600px] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
