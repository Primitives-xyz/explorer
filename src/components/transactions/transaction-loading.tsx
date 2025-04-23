import { cn } from '@/utils/utils'

export const TransactionLoading = () => (
  <div className="py-4 flex items-center gap-2">
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full bg-primary",
            "animate-bounce",
            i === 1 && "animation-delay-200",
            i === 2 && "animation-delay-400"
          )}
        />
      ))}
    </div>
    <span className="text-muted-foreground">Loading transaction</span>
  </div>
) 