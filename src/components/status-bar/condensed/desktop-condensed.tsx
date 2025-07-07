'use client'

import { AuraStatusIcon } from '@/components/status-bar/aura-status-icon'
import { StatusBarData } from '@/components/status-bar/status-bar'
import { TopRightForm } from '@/components/status-bar/top-right-form'
import Image from 'next/image'

interface Props {
  data: StatusBarData
}

export function DesktopCondensed({ data }: Props) {
  return (
    <div className="w-full h-[30px] my-5 mb-14 mt:10 border-primary border-1 flex">
      <div className="h-full w-1/5 bg-background flex items-center justify-around text-primary text-sm uppercase">
        <AuraStatusIcon />
      </div>
      <div className="h-full w-2/5 bg-primary/45 flex items-center">
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
        <div className="w-1/2 h-full flex items-center justify-between px-2 text-xs">
          <p className="text-foreground">PNL</p>
          <p className="text-foreground font-bold">{data.walletPnL}</p>
        </div>
      </div>
      <div className="h-full w-2/5 bg-primary flex items-center justify-around text-background text-sm uppercase">
        <span className="flex items-center">
          <p>All-Time Savings</p>
          <span className="font-bold ml-2">{data.allTimeSavings}</span>
        </span>
        <TopRightForm />
      </div>
    </div>
  )
}
