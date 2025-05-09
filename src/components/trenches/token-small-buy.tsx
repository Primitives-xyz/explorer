import { useState } from 'react'
import { Button } from '@/components/ui/button/button'

export function TokenSmallBuy({ onBuy, min = 0.01, step = 0.01, initialAmount = 0.01, mint }: { onBuy: (mint: string, amount: number) => void, min?: number, step?: number, initialAmount?: number, mint: string }) {
  const [buyAmount, setBuyAmount] = useState(initialAmount)

  return (
    <div className="flex flex-row items-center justify-start w-full mt-0.5 gap-2">
      <Button
        variant="ghost"
        className="w-6 h-6 flex items-center justify-center rounded bg-primary/20 hover:bg-primary/30 text-base leading-none font-bold"
        style={{ minWidth: 24, minHeight: 24, padding: 0 }}
        onClick={e => { e.stopPropagation(); setBuyAmount(Math.max(min, parseFloat((buyAmount - step).toFixed(2)))) }}
        type="button"
        tabIndex={0}
        aria-label="Decrease amount"
      >
        -
      </Button>
      <Button
        variant="default"
        className="flex flex-row items-center justify-center rounded font-bold text-sm px-4 h-8 min-w-[90px] max-w-[120px] shadow-md neon-glow"
        style={{ height: 32, minWidth: 90, maxWidth: 120, fontSize: '15px', letterSpacing: '0.03em' }}
        onClick={() => onBuy(mint, buyAmount)}
        type="button"
        aria-label={`Buy ${buyAmount.toFixed(2)}`}
      >
        BUY {buyAmount.toFixed(2)}
      </Button>
      <Button
        variant="ghost"
        className="w-6 h-6 flex items-center justify-center rounded bg-primary/20 hover:bg-primary/30 text-base leading-none font-bold"
        style={{ minWidth: 24, minHeight: 24, padding: 0 }}
        onClick={e => { e.stopPropagation(); setBuyAmount(parseFloat((buyAmount + step).toFixed(2))) }}
        type="button"
        tabIndex={0}
        aria-label="Increase amount"
      >
        +
      </Button>
      <style>{`
        .neon-glow {
          box-shadow: 0 0 6px 1px #39ff14, 0 0 12px 2px #39ff14;
        }
      `}</style>
    </div>
  )
} 