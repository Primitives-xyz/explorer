import { AuraStatusIcon } from '@/components/status-bar/aura-status-icon'
import { StatusBarData } from '@/components/status-bar/status-bar'
import { cn } from '@/utils/utils'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface Props {
  data: StatusBarData
}

export function MobileCondensed({ data }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div
      className={cn(
        {
          'border-x-1 border-t-1 border-b-0': !isOpen,
          'border-1': isOpen,
        },
        'w-full my-5 mb-14 mt:10 border-primary'
      )}
    >
      <div className="flex items-center h-[25px] text-xs border-b-1 border-primary">
        <div className="w-[35%] h-full bg-background flex items-center justify-center text-primary">
          <AuraStatusIcon points={data.auraPoints} />
        </div>
        <div className="w-[calc(65%-30px)] h-full bg-primary flex items-center justify-center text-background">
          <p>All-Time Savings</p>
          <span className="font-bold ml-2">{data.allTimeSavings}</span>
        </div>
        <div className="w-[30px] h-full bg-primary flex items-center justify-center text-background">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-background rounded-none h-full w-full border-none flex items-center justify-center outline-none"
          >
            <ChevronDown
              className="text-foreground transition-transform duration-200"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
        </div>
      </div>

      <div
        className={`bg-primary/45 flex justify-end items-center border-primary overflow-hidden transition-all duration-200 ease-in-out`}
        style={{
          height: isOpen ? '25px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="w-1/2 h-full border-r-1 border-primary flex items-center justify-between px-2 text-xs">
          <span className="flex items-center">
            <Image
              src="/images/sse.png"
              alt="sse"
              width={14}
              height={14}
              className="mr-1 rounded-full"
            />
            <p className="text-primary text-xs">$SSE OWNED</p>
          </span>
          <p className="text-foreground font-bold">{data.balance}</p>
        </div>
        <div className="w-1/2 h-full border-r-1 border-primary flex items-center justify-between px-2 text-xs">
          <p className="text-foreground">SOLID</p>
          <p className="text-foreground font-bold">{data.solidScore}</p>
        </div>
      </div>
    </div>
  )
}
