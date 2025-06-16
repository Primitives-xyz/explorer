import { StatusBarData } from '@/components/status-bar/status-bar'
import { TopRightForm } from '@/components/status-bar/top-right-form'
import Image from 'next/image'

interface Props {
  data: StatusBarData
}

export function DesktopCondensed({ data }: Props) {
  return (
    <div className="w-full h-[30px] my-5 mb-14 mt:10 border-primary border-1 overflow-hidden">
      <div className="flex animate-marquee h-full whitespace-nowrap">
        <div className="flex shrink-0 w-[1200px]">
          <div className="h-full w-[300px] bg-background flex items-center justify-around text-primary text-sm uppercase">
            <div className="flex items-center">
              <Image
                src="/images/status-bar/status-bar-form.svg"
                alt="Aura Status"
                width={18}
                height={18}
                className="mr-2"
              />
              <span className="font-bold mr-2">{data.auraPoints}</span>
            </div>
            <div className="flex items-center">
              <span className="desktop">AURA STATUS:</span>
              <span className="font-bold ml-2">{data.status}</span>
            </div>
          </div>

          <div className="h-full w-[550px] bg-primary/45 flex items-center">
            <div className="w-1/3 h-full border-r-1 border-primary flex items-center justify-between px-2 text-xs">
              <span className="flex items-center">
                <Image
                  src="/images/sse.png"
                  alt="sse"
                  width={14}
                  height={14}
                  className="mr-1 rounded-full"
                />
                <p className="text-primary text-xs desktop">$SSE OWNED</p>
              </span>
              <p className="text-foreground font-bold">{data.balance}</p>
            </div>
            <div className="w-1/3 h-full border-r-1 border-primary flex items-center justify-between px-2 text-xs">
              <p className="text-foreground">SOLID</p>
              <p className="text-foreground font-bold">{data.solidScore}</p>
            </div>
            <div className="w-1/3 h-full flex items-center justify-between px-2 text-xs">
              <p className="text-foreground desktop">LIVE PnL</p>
              <p className="text-foreground mobile">PnL</p>
              <p className="text-foreground font-bold">{data.pnl}</p>
            </div>
          </div>

          <div className="h-full w-[350px] bg-primary flex items-center justify-around text-background text-sm uppercase">
            <span className="flex items-center">
              <p>All-Time Savings</p>
              <span className="font-bold ml-2">{data.allTimeSavings}</span>
            </span>
            <TopRightForm />
          </div>
        </div>
      </div>
    </div>
  )
}
