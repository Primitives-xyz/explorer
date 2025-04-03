import { cn } from '@/utils/utils'
import { ReactNode } from 'react'

interface DataCardProps {
  children: ReactNode
  className?: string
  title?: ReactNode
  titleRight?: ReactNode
  error?: string | null
  loading?: boolean
  loadingText?: string
  borderColor?: 'violet' | 'indigo'
}

export function DataCard({
  children,
  className,
  title,
  titleRight,
  error,
  loading,
  loadingText = 'Loading...',
  borderColor = 'violet',
}: DataCardProps) {
  const borderColorClass =
    borderColor === 'violet' ? 'border-violet-500/50' : 'border-indigo-800'
  const bgColorClass =
    borderColor === 'violet' ? 'bg-violet-950/20' : 'bg-black/20'
  const pulseColorClass =
    borderColor === 'violet' ? 'bg-violet-500' : 'bg-indigo-500'
  const textColorClass =
    borderColor === 'violet' ? 'text-violet-400' : 'text-indigo-500'

  return (
    <div
      className={cn(
        'border bg-black/50 w-full overflow-hidden flex flex-col backdrop-blur-xs',
        borderColorClass,
        className
      )}
    >
      {(title || titleRight) && (
        <div
          className={cn(
            'border-b p-3 shrink-0',
            borderColorClass,
            bgColorClass
          )}
        >
          <div className="flex items-center justify-between">
            {title && (
              <div
                className={cn(
                  'text-sm font-mono flex items-center gap-2',
                  textColorClass
                )}
              >
                <span
                  className={cn(
                    'w-2 h-2 rounded-full animate-pulse',
                    pulseColorClass
                  )}
                />
                {'>'} {title}
              </div>
            )}
            {titleRight && <div className="flex gap-2">{titleRight}</div>}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 m-4 text-red-400 text-sm border border-red-900/50 rounded-lg bg-red-900/10">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            Error: {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 flex flex-col items-center gap-4">
          <div
            className={cn(
              'w-8 h-8 border-2 border-t-transparent rounded-full animate-spin',
              `border-${borderColor}-500`
            )}
          />
          <div className={cn('font-mono animate-pulse', textColorClass)}>
            {`>>> ${loadingText}`}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
