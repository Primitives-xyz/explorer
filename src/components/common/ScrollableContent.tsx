import { ReactNode } from 'react'

interface ScrollableContentProps {
  children: ReactNode
  isLoading?: boolean
  loadingText?: string
  emptyText?: string
  isEmpty?: boolean
  accentColor?: 'green' | 'indigo'
}

export const ScrollableContent = ({
  children,
  isLoading,
  loadingText = '>>> LOADING...',
  emptyText = '>>> NO ITEMS FOUND',
  isEmpty = false,
  accentColor = 'green',
}: ScrollableContentProps) => {
  const colorClasses = {
    green: {
      text: 'text-green-600',
      border: 'border-green-500',
      scrollThumb: 'scrollbar-thumb-green-900/50',
      divide: 'divide-green-800/30',
    },
    indigo: {
      text: 'text-indigo-600',
      border: 'border-indigo-500',
      scrollThumb: 'scrollbar-thumb-indigo-900/50',
      divide: 'divide-indigo-800/30',
    },
  }

  const colors = colorClasses[accentColor]

  return (
    <div
      className={`divide-y ${colors.divide} overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 ${colors.scrollThumb}`}
    >
      {isLoading ? (
        <div className="p-8 flex flex-col items-center gap-4">
          <div
            className={`w-8 h-8 border-2 ${colors.border} border-t-transparent rounded-full animate-spin`}
          />
          <div className={`${colors.text} font-mono animate-pulse`}>
            {loadingText}
          </div>
        </div>
      ) : isEmpty ? (
        <div className="p-4 text-center text-green-600 font-mono">
          {emptyText}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
