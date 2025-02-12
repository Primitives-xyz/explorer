interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  symbol: string
}

export const ImageModal = ({
  isOpen,
  onClose,
  imageUrl,
  symbol,
}: ImageModalProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-lg w-full mx-4">
        <div
          className="bg-black/90 border border-green-800 rounded-lg p-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-green-600 hover:text-green-400 font-mono text-sm"
          >
            [close]
          </button>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={symbol}
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.parentElement?.classList.add(
                  'min-h-[200px]',
                  'flex',
                  'items-center',
                  'justify-center'
                )
                target.insertAdjacentHTML(
                  'afterend',
                  `<div class="text-green-500/50 font-mono text-sm">Image failed to load</div>`
                )
              }}
            />
          ) : (
            <div className="min-h-[200px] rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/10 flex items-center justify-center">
              <div className="text-green-500/50 font-mono text-sm">
                No image available
              </div>
            </div>
          )}
          <div className="text-center mt-2 text-green-500 font-mono text-sm">
            {symbol || 'Untitled'}
          </div>
        </div>
      </div>
    </div>
  )
}
