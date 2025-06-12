import { Avatar } from '@/components/ui/avatar/avatar'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import Image from 'next/image'

export function StatusBar() {
  const { mainProfile } = useCurrentWallet()

  if (
    mainProfile?.userRevealedTheSolidScore &&
    mainProfile?.userHasClickedOnShareHisSolidScore
  )
    return (
      <div className="w-full h-[100px] relative my-10">
        <div className="absolute top-[15px] -left-[20px] bg-card-foreground w-[100px] h-[100px] z-30 rounded-full">
          <Avatar
            username={mainProfile?.username || ''}
            imageUrl={mainProfile?.image}
            size={100}
            className="w-[100px] h-[100px]  border-1 border-primary"
          />
        </div>
        <div className="h-3/10 flex items-end justify-end">
          <div className="h-full bg-primary w-3/5 rounded-t-md flex items-center justify-between px-2">
            <p className="text-background text-sm">
              SSE All-Time Savings:{' '}
              <span className="font-bold ml-2">$6.23M</span>
            </p>
            <div className="flex items-center bg-background h-1/2 justify-center px-4">
              <div className="w-3 h-2 bg-primary/20 border-2 border-y-muted border-x-card" />
              <div className="w-3 h-2 bg-primary/60 border-2 border-y-muted border-x-card" />
              <div className="w-3 h-2 bg-primary border-2 border-y-muted border-x-card" />
              <div className="w-3 h-2 bg-primary border-2 border-y-muted border-x-card" />
              <div className="w-3 h-2 bg-primary/60 border-2 border-y-muted border-x-card" />
              <div className="w-3 h-2 bg-primary/20 border-2 border-y-muted border-x-card" />
            </div>
          </div>
        </div>

        <div
          className="h-4/10 bg-primary flex items-center"
          style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
        >
          <div
            className="w-[99.5%] h-[95%] bg-background pl-24 flex items-center justify-between pr-8"
            style={{ clipPath: 'polygon(0 0, 100% 0, 95.4% 100%, 0% 100%)' }}
          >
            <p className="text-primary font-bold uppercase truncate w-30">
              {mainProfile?.username}
            </p>
            <p className="text-primary flex items-center">
              <Image
                src="/images/status-bar/status-bar-form.svg"
                alt="Aura Status"
                width={18}
                height={18}
                className="mr-2"
              />
              <span className="font-bold mr-2">2,345</span>
              AURA STATUS: <span className="font-bold ml-2">DUST</span>
            </p>
          </div>
        </div>

        <div className="h-3/10 -mt-[0.2px] text-sm">
          <div className="h-full bg-primary/45 w-[95%] pl-19 rounded-b-md flex justify-end items-center border-r-1  border-b-1 border-primary">
            <div className="w-1/3 h-full border-r-1 border-primary flex items-center justify-between px-2 text-xs">
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
              <p className="text-foreground font-bold">342.3K</p>
            </div>
            <div className="w-1/3 h-full border-r-1 border-primary flex items-center justify-between px-2 text-xs">
              <p className="text-foreground">SOLID</p>
              <p className="text-foreground font-bold">234</p>
            </div>
            <div className="w-1/3 h-full flex items-center justify-between px-2 text-xs">
              <p className="text-foreground">LIVE PnL</p>
              <p className="text-foreground font-bold">6.4</p>
            </div>
          </div>
        </div>
      </div>
    )
}
