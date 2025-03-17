'use client'

type ViewMode = 'grid' | 'list'

interface NFTViewToggleProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

export function NFTViewToggle({ viewMode, setViewMode }: NFTViewToggleProps) {
  return (
    <div className="flex items-center bg-black/50 rounded-md border border-green-800/30 p-0.5">
      <button
        onClick={() => setViewMode('grid')}
        className={`px-2 py-1 text-xs rounded-sm ${
          viewMode === 'grid'
            ? 'bg-green-800/30 text-green-400'
            : 'text-green-500/70 hover:text-green-400'
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`px-2 py-1 text-xs rounded-sm ${
          viewMode === 'list'
            ? 'bg-green-800/30 text-green-400'
            : 'text-green-500/70 hover:text-green-400'
        }`}
      >
        List
      </button>
    </div>
  )
}
