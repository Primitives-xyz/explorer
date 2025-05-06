import { useState } from 'react'
import { Button } from '@/components/ui/button/button'

export function TokenSmallBuy({ onBuy, min = 0.01, step = 0.01, initialAmount = 0.01, mint }: { onBuy: (mint: string, amount: number) => void, min?: number, step?: number, initialAmount?: number, mint: string }) {
  const [buyAmount, setBuyAmount] = useState(initialAmount)

  return (
    <div className="flex flex-row items-center justify-start w-full mt-0.5 gap-1">
      <Button
        variant="default"
        className="flex flex-row items-center rounded font-bold text-xs p-0 h-6 min-w-[60px] max-w-[80px] shadow-none"
        style={{ height: 24, minWidth: 60, maxWidth: 80 }}
        onClick={() => onBuy(mint, buyAmount)}
        type="button"
      >
        <span className="flex-1 text-xs px-2 select-none">+{buyAmount.toFixed(2)}</span>
      </Button>
      <div className="flex flex-col items-center justify-center pr-1 gap-0.5">
        <Button
          variant="ghost"
          className="w-4 h-3 flex items-center justify-center rounded bg-primary/20 hover:bg-primary/30 text-xs leading-none"
          style={{ fontWeight: 700, fontSize: '10px', minWidth: 0, minHeight: 0, padding: 0 }}
          onClick={e => { e.stopPropagation(); setBuyAmount(parseFloat((buyAmount + step).toFixed(2))) }}
          type="button"
          tabIndex={0}
        >
          +
        </Button>
        <Button
          variant="ghost"
          className="w-4 h-3 flex items-center justify-center rounded bg-primary/20 hover:bg-primary/30 text-xs leading-none"
          style={{ fontWeight: 700, fontSize: '10px', minWidth: 0, minHeight: 0, padding: 0 }}
          onClick={e => { e.stopPropagation(); setBuyAmount(Math.max(min, parseFloat((buyAmount - step).toFixed(2)))) }}
          type="button"
          tabIndex={0}
        >
          -
        </Button>
      </div>
      <style>{`
        .neon-glow {
          box-shadow: 0 0 6px 1px #39ff14, 0 0 12px 2px #39ff14;
        }
      `}</style>
    </div>
  )
} 