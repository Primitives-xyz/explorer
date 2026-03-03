'use client'

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
  Spinner,
} from '@/components/ui'
import { useTranslations } from 'next-intl'

import { CircleAlertIcon } from 'lucide-react'

interface Props {
  quoteResponse: Record<string, any> | null
  outputTokenSymbol?: string
  outputTokenDecimals?: number
  expectedOutput: string
  isQuoteRefreshing: boolean
}

export function BottomSwap({
  quoteResponse,
  outputTokenSymbol,
  outputTokenDecimals,
  expectedOutput,
  isQuoteRefreshing,
}: Props) {
  const t = useTranslations()

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="flex items-center justify-between text-primary font-semibold">
          <p>{t('swap.token.route_info')}</p>
          <CircleAlertIcon size={20} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue=""
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
      </CardContent>
    </Card>
  )
}
