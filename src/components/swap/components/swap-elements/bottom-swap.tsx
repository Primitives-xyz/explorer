'use client'

import { PlatformComparison } from '@/components/swap/components/platform-comparison'
import { QuoteResponse } from '@/components/tapestry/models/jupiter.models'
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
import Warning from '@/components/ui/warning'
import { useTranslations } from 'next-intl'

import { useIsMobile } from '@/utils/use-is-mobile'
import { cn } from '@/utils/utils'
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
  notEnoughSSE?: boolean
  hasUsedSSEBefore?: boolean
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
  notEnoughSSE,
  hasUsedSSEBefore,
}: Props) {
  const t = useTranslations()
  const { isMobile } = useIsMobile()

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="flex items-center justify-between text-primary font-semibold">
          <p>{t('swap.token.route_info')}</p>
          <CircleAlertIcon size={20} />
        </CardTitle>
        {notEnoughSSE && (
          <div className="mb-2 mt-3">
            <Warning variant="loud">
              {hasUsedSSEBefore
                ? t('swap.token.fee_exceeds_balance')
                : t('swap.token.not_enough_sse_for_fees')}
            </Warning>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <label htmlFor="pay_fee_with_sse" className="block">
          <Card
            className={cn(
              {
                'border-primary': useSSEForFees,
              },
              'cursor-pointer'
            )}
          >
            <CardContent className="flex space-x-3 p-3 bg-card">
              <Checkbox
                id="pay_fee_with_sse"
                checked={useSSEForFees}
                onClick={() => setUseSSEForFees(!useSSEForFees)}
                onChange={() => {}}
                className="pointer-events-none mt-1"
                size={CheckboxSize.LG}
              />
              <div className="flex flex-col">
                <span className="text-sm">{t('swap.token.pay_with_sse')}</span>
                <span className="text-muted-foreground text-xs">
                  {t('swap.token.get_discount')}
                </span>
              </div>
            </CardContent>
          </Card>
        </label>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p>{t('swap.fee.amount')}</p>
            <p>{displaySseFeeAmount} SSE</p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={isMobile ? '' : 'item-1'}
          >
            <AccordionItem value="item-1">
              <AccordionTrigger
                className="text-muted-foreground text-left p-3"
                chevronSize={20}
              >
                {t('swap.fee.description')}
              </AccordionTrigger>
              <AccordionContent className="p-3 pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="uppercase">Platform</p>
                    <p className="text-muted-foreground">
                      {t('swap.price.minimum_received')}
                    </p>
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
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  )
}
