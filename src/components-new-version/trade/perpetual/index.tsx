'use client'

import { Info, ExternalLink, Settings, ChevronDown, CircleAlert, Loader2, ArrowRight } from "lucide-react"
import ToggleSwitch from "./toggle-switch";
import LeverageSelector from "./leverage-selector";
import { Toggle } from "@/components-new-version/ui/switch/toggle";
import { useCurrentWallet } from "@/components/auth/hooks/use-current-wallet";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SSE_MINT } from "@/components/trading/constants";
import DynamicConnectButton from "@/components-new-version/common/dynamic-button";

const Perpetual = () => {
  const t = useTranslations()
  const { isLoggedIn, sdkHasLoaded } = useCurrentWallet()
  const [loading, setLoading] = useState<boolean>(false)

  return (
    <div>
      <div className='flex flex-row gap-4 justify-between'>
        <div className="w-[600px] flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white/5 border border-white/20 rounded-[12px] px-4 py-2 text-white text-[16px]">
            <div className="flex flex-col items-center">
              <span>Net USD Value</span>
              <div className="w-full flex justify-between items-center gap-1">
                <span className="font-semibold text-white">$25.6</span>
                <Info className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span>Acct. Leverage</span>
              <div className="w-full flex justify-between items-center gap-1">
                <span className="font-semibold text-white">0.00x</span>
                <Info className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span>Health</span>
              <div className="w-full flex justify-between items-center gap-1">
                <span className="font-semibold text-[#97EF83]">100%</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ToggleSwitch onChange={(value) => console.log(`Selected: ${value}`)} />
          </div>

          <div className="bg-white/5 border border-white/20 p-4 rounded-[20px] flex flex-col gap-4">
            <div className="flex flex-row justify-between text-[18px] py-2 text-[#F5F8FD] font-bold border-b border-white/20">
              <div className="flex gap-3">
                <span className="cursor-pointer text-[#97EF83]">Market</span>
                <span className="cursor-pointer">Limit</span>
                <div className="flex items-center gap-1">
                  <span className="cursor-pointer">Pro Orders</span>
                  <ChevronDown />
                </div>
              </div>
              <CircleAlert className="text-[#97EF83]" />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="text-[20px] font-bold leading-[150%]">Leverage</p>
                <Settings />
              </div>
              <div className="flex items-center justify-center">
                <LeverageSelector onChange={(value) => console.log(`Selected leverage: ${value}x`)} />
              </div>
            </div>

            <div className="flex flex-row items-center text-[18px] gap-2">
              <span className="cursor-pointer">Slippage Tolerance (Dynamic)</span>
              <ChevronDown />
            </div>

            <div className="flex items-center gap-2">
              <span className="uppercase text-[18px] font-bold leading-[150%]">SWIFT</span>
              <Toggle />
            </div>
          </div>

          <div>
            {!sdkHasLoaded ? (
              <div className="w-full p-3 bg-[#97EF83] rounded-[6px] text-[#292C31] font-bold leading-[150%] cursor-pointer text-center">
                {t('trade.checking_wallet_status')}
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
            ) : !isLoggedIn ? (
              <div className='w-full'>
                <DynamicConnectButton buttonClassName='w-full'>
                  <div className="p-3 bg-[#97EF83] rounded-[6px] text-[#292C31] font-bold leading-[150%] cursor-pointer text-center">
                    {t('trade.connect_wallet_to_swap')}
                  </div>
                </DynamicConnectButton>
              </div>
            ) : (
              <button
                // onClick={handleSwap}
                disabled={loading}
                className="w-full p-3 bg-[#97EF83] rounded-[6px] text-[#292C31] font-bold leading-[150%] cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                ) : (
                  'Long ~3.88 TRUMP-Perp'
                )}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-[20px] p-4">
            <div className="flex justify-between items-center text-[#97EF83] pb-2 border-b border-b-white/20">
              <span className="text-[18px] font-bold">Dynamic Slippage</span>
              <span className="text-[14p] uppercase">Fee 0.00%</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Est.Liquidation Price</span>
              <span className="flex gap-1 items-center text-[14px]">None <ArrowRight className="text-[14px]" /> $128.0688 </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Acct. Leverage</span>
              <span className="flex gap-1 items-center text-[14px]">0x <ArrowRight className="text-[14px]" /> 19.4x </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Acct. Leverage</span>
              <span className="flex gap-1 items-center text-[14px]">0 <ArrowRight className="text-[14px]" /> 3.88 LONG </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Fees</span>
              <span className="text-[14px]">$0.25</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Show Confirmation</span>
              <Toggle />
            </div>
          </div>
        </div>
        <div className='w-full'>
          <div className='bg-white/10 rounded-[20px] w-full h-[400px] p-4'>
            <iframe
              width="100%"
              height="100%"
              src={`https://birdeye.so/tv-widget/${SSE_MINT}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&theme=dark&defaultMetric=mcap`}
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      </div>
      <div className="h-[20px]"></div>
    </div>

  )
}

export default Perpetual;