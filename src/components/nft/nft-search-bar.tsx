'use client'

interface NFTSearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export function NFTSearchBar({ searchTerm, setSearchTerm }: NFTSearchBarProps) {
  return (
    <div className="relative grow md:grow-0 md:w-48">
      <input
        type="text"
        placeholder="Search NFTs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-black/80 border border-green-800/50 text-green-400 text-sm rounded-md p-1.5 pl-8"
      />
      <span className="absolute left-2.5 top-2 text-green-500/50">🔍</span>
    </div>
  )
}
