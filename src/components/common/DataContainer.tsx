import { ReactNode } from 'react'

interface DataContainerProps {
  title: string
  count?: number
  children: ReactNode
  error?: string | null
  className?: string
  headerRight?: ReactNode
  accentColor?: 'green' | 'indigo'
  height?: 'normal' | 'large'
}

export const DataContainer = ({
  title,
  count,
  children,
  error,
  className = '',
  headerRight,
  accentColor = 'green',
  height = 'large',
}: DataContainerProps) => {
  const colorClasses = {
    green: {
      border: 'border-green-800',
      text: 'text-green-500',
      dot: 'bg-green-500',
      count: 'text-green-600',
      countBg: 'bg-green-900/20',
    },
    indigo: {
      border: 'border-indigo-800',
      text: 'text-indigo-500',
      dot: 'bg-indigo-500',
      count: 'text-indigo-600',
      countBg: 'bg-indigo-900/20',
    },
  }

  const colors = colorClasses[accentColor]
  const heightClass =
    height === 'large' ? 'h-[400px] lg:h-[600px]' : 'h-[284px] lg:h-[484px]'

  return (
    <div
      className={`border ${colors.border} bg-black/50 w-full overflow-hidden flex flex-col ${heightClass} relative group backdrop-blur-sm ${className}`}
    >
      {/* Header */}
      <div
        className={`border-b ${colors.border} p-4 flex-shrink-0 bg-black/20`}
      >
        <div className="flex justify-between items-center">
          <div
            className={`${colors.text} text-sm font-mono flex items-center gap-2`}
          >
            <span
              className={`w-2 h-2 ${colors.dot} rounded-full animate-pulse`}
            />
            {'>'} {title}
          </div>
          <div className="flex items-center gap-2">
            {count !== undefined && (
              <div
                className={`text-xs ${colors.count} font-mono ${colors.countBg} px-3 py-1 rounded-full`}
              >
                COUNT: {count}
              </div>
            )}
            {headerRight}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span>! ERROR: {error}</span>
        </div>
      )}

      {/* Content */}
      {children}

      {/* Scroll Progress Indicator */}
      <div className="absolute right-2 top-[48px] bottom-2 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`h-full ${colors.text}/5 rounded-full`}>
          <div
            className={`h-24 w-full ${colors.text}/20 rounded-full animate-pulse`}
          ></div>
        </div>
      </div>
    </div>
  )
}
