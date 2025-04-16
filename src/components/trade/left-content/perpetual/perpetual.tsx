'use client'

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Info, ExternalLink, Settings, ChevronDown, CircleAlert, ArrowRight, Zap, Infinity, ChevronUp } from "lucide-react"
import { Button, ButtonSize, ButtonVariant, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Spinner, Switch } from "@/components/ui"
import { Card, CardContent } from '@/components/ui/card'
import { useCurrentWallet } from "@/utils/use-current-wallet"
import { cn } from "@/utils/utils"

enum PositionDirection {
  LONG = "long",
  SHORT = "short"
}

enum OrderType {
  MARKET = "market",
  LIMIT = "limit",
  PRO = "pro"
}

enum ProOrderType {
  STOP_MARKET = "Stop Market",
  STOP_LIMIT = "Stop Limit",
  TAKE_PROFIT_MARKET = "Take Profit",
  TAKE_PROFIT_LIMIT = "Take Profit Limit",
  ORACLE_Limit = "Oracle Market",
  SCALE = "Scale",
}

enum PerpsMarketType {
  SOL = "SOL",
  USDC = "USDC",
}

const slippageOptions = [
  { value: "0.1", label: "0.1%" },
  { value: "0.5", label: "0.5%" },
  { value: "1", label: "1%" },
  { value: "zap", icon: <Zap size={16} /> },
  { value: "infinity", icon: <Infinity size={16} /> },
  { value: "dynamic", label: "Dynamic" },
]

export function Perpetual() {
  const t = useTranslations()
  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow } = useCurrentWallet()
  const [loading, setLoading] = useState<boolean>(false)
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET)
  const [proOrderType, setProOrderType] = useState<ProOrderType>(ProOrderType.STOP_MARKET)
  const [perpsMarketType, setPerpsMarketType] = useState<PerpsMarketType>(PerpsMarketType.SOL)
  const [selectedDirection, setSelectedDirection] = useState<PositionDirection>(PositionDirection.LONG)
  const [slippageExpanded, setSlippageExpanded] = useState<boolean>(false)
  const [slippageOption, setSlippageOption] = useState<string>("0.1")
  const [swift, setSwift] = useState<boolean>(false)
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)

  const handleToggle = (value: PositionDirection) => {
    setSelectedDirection(value)
  }

  return (
    <div className='w-full'>
      <div className="space-y-4">
        <Card>
          <CardContent className="grid grid-cols-3 px-4 py-2 gap-4">
            <div className="flex flex-col items-center">
              <span className="w-full">Net USD Value</span>
              <div className="w-full flex items-center space-x-3">
                <span className="font-semibold text-white">$25.6</span>
                <Info size={16} />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="w-full">Acct. Leverage</span>
              <div className="w-full flex items-center space-x-3">
                <span className="font-semibold text-white">0.00x</span>
                <Info size={16} />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="w-full">Health</span>
              <div className="w-full flex items-center space-x-3">
                <span className="font-semibold text-primary">100%</span>
                <ExternalLink size={16} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <Button
            variant={selectedDirection === PositionDirection.LONG ? ButtonVariant.DEFAULT : ButtonVariant.GHOST}
            className="w-1/2"
            onClick={() => handleToggle(PositionDirection.LONG)}
          >
            Long
          </Button>
          <Button
            variant={selectedDirection === PositionDirection.SHORT ? ButtonVariant.DEFAULT : ButtonVariant.GHOST}
            className="w-1/2"
            onClick={() => handleToggle(PositionDirection.SHORT)}
          >
            Short
          </Button>
        </Card>

        <Card>
          <CardContent>
            {/* Order Type */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Button
                  variant={ButtonVariant.GHOST}
                  className={cn(
                    "cursor-pointer",
                    orderType === OrderType.MARKET && "text-primary"
                  )}
                  onClick={() => setOrderType(OrderType.MARKET)}
                >
                  Market
                </Button>
                <Button
                  variant={ButtonVariant.GHOST}
                  className={cn(
                    "cursor-pointer",
                    orderType === OrderType.LIMIT && "text-primary"
                  )}
                  onClick={() => setOrderType(OrderType.LIMIT)}
                >
                  Limit
                </Button>
                <Select
                  value={proOrderType}
                  defaultValue="Pro Orders"
                  onValueChange={(value) => {
                    setProOrderType(value as ProOrderType)
                    setOrderType(OrderType.PRO)
                  }}
                >
                  <SelectTrigger
                    className={
                      cn(
                        "bg-transparent h-12 border-none text-normal text-white",
                        orderType === OrderType.PRO && "text-primary"
                      )
                    }
                  >
                    <SelectValue defaultValue="Pro Orders" />
                  </SelectTrigger>
                  <SelectContent className="border border-primary text-primary">
                    {
                      Object.values(ProOrderType).map((type, index) => (
                        <SelectItem value={type} key={index}>
                          {type}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <CircleAlert className="text-primary" />
            </div>

            <Separator className="mt-0 mb-2" />

            {
              orderType === OrderType.MARKET && (
                <div className="space-y-4">
                  {/* Size */}
                  <div className="flex justify-between items-center">
                    <span>Size</span>
                    <Button>
                      Max: $212
                    </Button>
                  </div>

                  {/* Market */}
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="flex items-center">
                      <Input
                        placeholder="0.00"
                        className="text-primary text-xl bg-transparent placeholder:text-primary border-none"
                        type="text"
                      />

                      <Select
                        value={perpsMarketType}
                        onValueChange={(value) => {
                          setPerpsMarketType(value as PerpsMarketType)
                        }}
                      >
                        <SelectTrigger
                          className="bg-transparent border-none text-normal text-white"
                        >
                          <Image
                            src={"https://ipfs.io/ipfs/QmT4fG3jhXv3dcvEVdkvAqi8RjXEmEcLS48PsUA5zSb1RY"}
                            alt="USDC"
                            width={30}
                            height={30}
                            className="rounded-full mx-1"
                          />
                        </SelectTrigger>
                        <SelectContent className="border border-primary text-primary">
                          <SelectItem value={PerpsMarketType.SOL}>
                            SOL
                          </SelectItem>
                          <SelectItem value={PerpsMarketType.USDC}>
                            TRUMP
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Card>
                    <Card className="flex items-center">
                      <Input
                        placeholder="0.00"
                        className="text-primary text-xl bg-transparent placeholder:text-primary border-none"
                        type="text"
                      />
                      <Image
                        src={"https://ipfs.io/ipfs/QmT4fG3jhXv3dcvEVdkvAqi8RjXEmEcLS48PsUA5zSb1RY"}
                        alt="USDC"
                        width={30}
                        height={30}
                        className="rounded-full mx-1"
                      />
                    </Card>
                  </div>

                  {/* Leverage */}
                  <div className="flex justify-between items-center">
                    <span>Leverage</span>
                    <Settings />
                  </div>

                  {/* Slippage Tolerance */}
                  <div className="space-y-2">
                    <div
                      className="flex items-center justify-between w-full cursor-pointer"
                      onClick={() => setSlippageExpanded(!slippageExpanded)}
                    >
                      <span>Slippage Tolerance (Dynamic)</span>
                      {slippageExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {slippageExpanded && (
                      <div className="grid grid-cols-6 gap-2">
                        {slippageOptions.map((option) => (
                          <Button
                            variant={slippageOption === option.value ? ButtonVariant.DEFAULT : ButtonVariant.BADGE}
                            key={option.value}
                            onClick={() => setSlippageOption(option.value)}
                          >
                            {option.icon || option.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Swift */}
                  <div className="flex items-center space-x-2">
                    <span>SWIFT</span>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setSwift(false)}
                        className={cn('text-sm', {
                          'text-muted-foreground': swift,
                        })}
                        isInvisible
                      >
                      </Button>
                      <Switch checked={swift} onCheckedChange={setSwift} />
                      <Button
                        onClick={() => setSwift(true)}
                        className={cn('text-sm', {
                          'text-muted-foreground': !swift,
                        })}
                        isInvisible
                      >
                      </Button>
                    </div>
                  </div>
                </div>
              )
            }
          </CardContent>
        </Card>

        <div>
          {!sdkHasLoaded ? (
            <Button
              variant={ButtonVariant.OUTLINE_WHITE}
              className="text-lg capitalize font-bold w-full"
              size={ButtonSize.LG}
            >
              <Spinner />
            </Button>
          ) : !isLoggedIn ? (
            <Button
              variant={ButtonVariant.OUTLINE_WHITE}
              className="text-lg capitalize font-bold w-full"
              size={ButtonSize.LG}
              onClick={() => setShowAuthFlow(true)}
            >
              Connect Wallet
            </Button>
          ) : (
            <Button
              onClick={() => { }}
              className="text-lg capitalize font-bold w-full"
              size={ButtonSize.LG}
              disabled={loading}
            >
              {loading ? <Spinner /> : <p>Long ~3.88 SOL-Perp</p>}
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-primary">
              <span>Dynamic Slippage</span>
              <span>Fee 0.00%</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span>Est.Liquidation Price</span>
              <span className="flex items-center space-x-1">None <ArrowRight className="text-[14px]" /> $128.0688 </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Acct. Leverage</span>
              <span className="flex items-center space-x-1">0x <ArrowRight className="text-[14px]" /> 19.4x </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Acct. Leverage</span>
              <span className="flex items-center space-x-1">0 <ArrowRight className="text-[14px]" /> 3.88 LONG </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Fees</span>
              <span className="text-[14px]">$0.25</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Show Confirmation</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowConfirmation(false)}
                  className={cn('text-sm', {
                    'text-muted-foreground': showConfirmation,
                  })}
                  isInvisible
                >
                </Button>
                <Switch checked={showConfirmation} onCheckedChange={setShowConfirmation} />
                <Button
                  onClick={() => setShowConfirmation(true)}
                  className={cn('text-sm', {
                    'text-muted-foreground': !showConfirmation,
                  })}
                  isInvisible
                >
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  )
}
