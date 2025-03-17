'use client'

interface NFTEmptyStateProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export function NFTEmptyState({
  searchTerm,
  setSearchTerm,
}: NFTEmptyStateProps) {
  return (
    <div className="text-center py-12 flex flex-col items-center">
      <svg
        className="w-16 h-16 text-green-500/40 mb-4"
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
      <h3 className="text-xl font-medium mb-3">No NFTs Found</h3>
      <p className="text-green-400/70 max-w-md">
        {searchTerm
          ? 'No NFTs match your search criteria. Try adjusting your search or clearing filters.'
          : "This wallet doesn't have any NFTs yet."}
      </p>
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="mt-4 px-4 py-2 bg-green-900/30 hover:bg-green-800/40 border border-green-800/50 rounded-md text-sm transition-colors"
        >
          Clear Search
        </button>
      )}
    </div>
  )
}
