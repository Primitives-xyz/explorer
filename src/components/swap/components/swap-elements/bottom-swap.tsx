'use client'

import { QuoteResponse } from '@/components/models/jupiter.models'
import { PlatformComparison } from '@/components/swap/components/platform-comparison'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Spinner,
} from '@/components/ui'
import { CheckboxSize } from '@/components/ui/switch/checkbox.models'

import { cn } from '@/components/utils/utils'
import { CircleAlertIcon } from 'lucide-react'

interface Props {
  useSSEForFees: boolean
  displaySseFeeAmount: string
  quoteResponse: QuoteResponse | null
  outputTokenSymbol?: string
  outputTokenDecimals?: number
  expectedOutput: string
  isQuoteRefreshing: boolean
  setUseSSEForFees: (useSSEForFees: boolean) => void
}

export function BottomSwap({
  useSSEForFees,
  displaySseFeeAmount,
  quoteResponse,
  outputTokenSymbol,
  outputTokenDecimals,
  expectedOutput,
  isQuoteRefreshing,
  setUseSSEForFees,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-primary font-bold">
          <p>Route Information $ Fees</p>
          <CircleAlertIcon size={20} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label htmlFor="pay_fee_with_sse" className="block">
          <Card
            className={cn(
              {
                'border-primary': useSSEForFees,
              },
              'cursor-pointer'
            )}
          >
            <CardContent className="flex items-center space-x-3 py-3 px-4">
              <Checkbox
                id="pay_fee_with_sse"
                checked={useSSEForFees}
                onClick={() => setUseSSEForFees(!useSSEForFees)}
                onChange={() => {}}
                className="pointer-events-none"
                size={CheckboxSize.LG}
              />
              <div className="flex flex-col">
                <span className="text-sm">Pay fee with SSE</span>
                <span className="text-muted-foreground text-xs">
                  Get 50% off on transaction fees
                </span>
              </div>
            </CardContent>
          </Card>
        </label>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p>RATE</p>
            <p>{displaySseFeeAmount} SSE</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-muted-foreground text-left">
                SSE offers the lowest fees across all current platforms
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="px-3 py-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="uppercase">platforms</p>
                      <p className="text-muted-foreground">You'll get</p>
                    </div>

                    <>
                      {isQuoteRefreshing ? (
                        <div className="h-full flex justify-center items-center">
                          <Spinner />
                        </div>
                      ) : (
                        <PlatformComparison
                          jupiterSwapResponse={quoteResponse}
                          outputTokenSymbol={outputTokenSymbol}
                          outputTokenDecimals={outputTokenDecimals}
                          platformExpectedOutAmount={expectedOutput}
                        />
                      )}
                    </>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  )
}
