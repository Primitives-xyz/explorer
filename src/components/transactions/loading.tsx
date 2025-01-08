import { type ReactElement } from 'react'

export default function Loading(): ReactElement {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="text-xs font-mono flex items-center gap-2 p-1 rounded bg-green-500/5"
        >
          <div className="w-4 h-4 rounded-full bg-green-500/20 animate-pulse" />
          <div className="w-6 h-6 rounded-full bg-green-500/20 animate-pulse" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-green-500/20 rounded w-24 animate-pulse" />
              <div className="h-3 bg-green-500/10 rounded w-16 animate-pulse" />
            </div>
            <div className="mt-1 h-3 bg-green-500/10 rounded w-32 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
