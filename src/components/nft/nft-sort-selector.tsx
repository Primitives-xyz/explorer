'use client'

type SortOption = 'default' | 'name' | 'newest' | 'rarity' | 'attributes'

interface NFTSortSelectorProps {
  sortOption: SortOption
  setSortOption: (option: SortOption) => void
}

export function NFTSortSelector({
  sortOption,
  setSortOption,
}: NFTSortSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-green-400">Sort by:</span>
      <select
        className="bg-black/80 border border-green-800/50 text-green-400 text-sm rounded-md p-1"
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as SortOption)}
      >
        <option value="default">Default</option>
        <option value="name">Name</option>
        <option value="newest">Newest</option>
        <option value="rarity">Rarity</option>
        <option value="attributes">Attributes</option>
      </select>
    </div>
  )
}
