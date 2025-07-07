'use client'

import { AuraStatusIcon } from '@/components/status-bar/aura-status-icon'
import { StatusBarData } from '@/components/status-bar/status-bar'
import { TopRightForm } from '@/components/status-bar/top-right-form'
import { Avatar } from '@/components/ui/avatar/avatar'
import Image from 'next/image'

interface Props {
  data: StatusBarData
}

export function DefaultStatusBar({ data }: Props) {
  return (
    <div className="w-full h-[80px] md:h-[100px] relative my-5 mb-14 mt:10">
      <div className="absolute top-[17px] md:top-[15px] -left-[15px] md:-left-[20px] bg-card-foreground w-[70px] h-[70px] md:w-[100px] md:h-[100px] z-30 rounded-full">
        <Avatar
          username={data?.username || ''}
          imageUrl={data?.image}
          size={100}
          className="w-[70px] h-[70px] md:w-[100px] md:h-[100px] border-1 border-primary"
        />
      </div>
      <div className="h-3/10 flex items-end justify-end">
        <div className="h-full bg-primary w-4/5 md:w-3/5 rounded-t-md flex items-center justify-between px-2">
          <span className="text-background text-xs md:text-sm flex items-center">
            <p className="desktop">SSE All-Time Savings: </p>
            <p className="mobile">All-Time Savings: </p>
            <span className="font-bold ml-2">
              {data.sseSavingsLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                data.allTimeSavings
              )}
            </span>
          </span>
          <TopRightForm />
        </div>
      </div>

      <div
        className="h-4/10 bg-primary flex items-center"
        style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
      >
        <div
          className="w-[99.5%] h-[95%] bg-background pl-15 md:pl-24 flex items-center justify-between pr-8 text-xs md:text-sm"
          style={{ clipPath: 'polygon(0 0, 100% 0, 95.4% 100%, 0% 100%)' }}
        >
          <p className="text-primary font-bold uppercase truncate w-20 md:w-30">
            {data?.username}
          </p>

          <AuraStatusIcon />
        </div>
      </div>

      <div className="h-3/10 -mt-[0.2px] text-sm">
        <div className="h-full bg-primary/45 w-[95%] pl-12 md:pl-19 rounded-b-md flex justify-end items-center border-r-1  border-b-1 border-primary">
          <div className="w-2/3 h-full border-r-1 border-primary flex items-center justify-between px-2 text-xs">
            <span className="flex items-center">
              <Image
                src="/images/sse.png"
                alt="sse"
                width={14}
                height={14}
                className="mr-1 rounded-full"
              />
              <p className="text-primary text-xs desktop">$SSE OWNED</p>
              <p className="text-primary text-xs mobile">$SSE</p>
            </span>
            <p className="text-foreground font-bold">
              {data.balanceLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                data.balance
              )}
            </p>
          </div>
          <div className="w-1/2 h-full border-r-1 border-primary flex items-center justify-between px-2 text-xs">
            <p className="text-foreground">SOLID</p>
            <p className="text-foreground font-bold">
              {data.solidScoreLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                data.solidScore
              )}
            </p>
          </div>
          <div className="w-1/2 h-full flex items-center justify-between px-2 text-xs">
            <p className="text-foreground">PNL</p>
            <p className="text-foreground font-bold">
              {data.walletPnLLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                data.walletPnL
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
