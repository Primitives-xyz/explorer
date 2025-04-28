'use client'

import { PlatformLogo } from '@/components/swap/components/platform-logo'
import { QuoteResponse } from '@/components/tapestry/models/jupiter.models'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { cn } from '@/utils/utils'
import { useMemo } from 'react'

interface Props {
  jupiterSwapResponse: QuoteResponse | null
  outputTokenSymbol?: string
  outputTokenDecimals?: number
  platformExpectedOutAmount: string
}

interface Platform {
  name: string
  outputAmount: string
  feePercentage: number
}

export function PlatformComparison({
  jupiterSwapResponse,
  outputTokenSymbol,
  outputTokenDecimals = 6,
  platformExpectedOutAmount,
}: Props) {
  const platforms = useMemo(() => {
    const allPlatforms: Platform[] = []
    const baseOutputAmount =
      jupiterSwapResponse && platformExpectedOutAmount
        ? Number.parseFloat(platformExpectedOutAmount)
        : 0

    // Add SSE platform first
    allPlatforms.push({
      name: 'SSE',
      outputAmount: baseOutputAmount
        ? formatSmartNumber(baseOutputAmount, {
            minimumFractionDigits: 2,
            maximumFractionDigits: outputTokenDecimals,
          })
        : '',
      feePercentage: 0.4,
    })

    // Add Jupiter with 1% fee
    allPlatforms.push({
      name: 'Jupiter',
      outputAmount: baseOutputAmount
        ? formatSmartNumber(baseOutputAmount * 0.99, {
            minimumFractionDigits: 2,
            maximumFractionDigits: outputTokenDecimals,
          })
        : '',
      feePercentage: 1,
    })

    // Calculate BullX output (2.214% fee)
    allPlatforms.push({
      name: 'BullX',
      outputAmount: baseOutputAmount
        ? formatSmartNumber(baseOutputAmount * 0.97786, {
            minimumFractionDigits: 2,
            maximumFractionDigits: outputTokenDecimals,
          })
        : '',
      feePercentage: 2.214,
    })

    // Calculate Photon output (4.4% fee)
    allPlatforms.push({
      name: 'Photon',
      outputAmount: baseOutputAmount
        ? formatSmartNumber(baseOutputAmount * 0.956, {
            minimumFractionDigits: 2,
            maximumFractionDigits: outputTokenDecimals,
          })
        : '',
      feePercentage: 4.4,
    })

    // Calculate Axiom output (6% fee)
    allPlatforms.push({
      name: 'Axiom',
      outputAmount: baseOutputAmount
        ? formatSmartNumber(baseOutputAmount * 0.94, {
            minimumFractionDigits: 2,
            maximumFractionDigits: outputTokenDecimals,
          })
        : '',
      feePercentage: 6,
    })

    // Sort by fee percentage (ascending) when no output amounts, otherwise by output amount (descending)
    return baseOutputAmount
      ? allPlatforms.sort(
          (a, b) =>
            Number.parseFloat(b.outputAmount) -
            Number.parseFloat(a.outputAmount)
        )
      : allPlatforms.sort((a, b) => a.feePercentage - b.feePercentage)
  }, [jupiterSwapResponse, platformExpectedOutAmount, outputTokenDecimals])

  return (
    <div className="space-y-1">
      {platforms.map((platform, index) => {
        const getTextColor = () => {
          if (platform.name === 'SSE') return 'text-primary'
          const position = index - 1
          const totalNonSse = platforms.length - 1
          if (position === 0) return 'text-orange-400'
          if (position === totalNonSse - 1) return 'text-red-700'
          return position < totalNonSse / 2 ? 'text-red-500' : 'text-red-600'
        }

        return (
          <div
            key={platform.name}
            className={cn(
              'flex items-center justify-between rounded-md py-1.5 px-2 pl-1',
              {
                'bg-primary/5': platform.name === 'SSE',
              }
            )}
          >
            <div className="flex items-center gap-2">
              <PlatformLogo name={platform.name} />
              <div className="flex flex-col">
                <span className="font-medium">{platform.name}</span>
                {platform.name === 'SSE' && (
                  <span className="text-xs text-primary font-medium">
                    Best price
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              {platform.outputAmount && (
                <div className="flex items-center gap-1">
                  <span
                    className={cn('font-medium', {
                      'text-primary font-bold': platform.name === 'SSE',
                      [getTextColor()]: platform.name !== 'SSE',
                    })}
                  >
                    {platform.outputAmount} {outputTokenSymbol}
                  </span>
                </div>
              )}
              <span
                className={cn('text-sm', {
                  'text-primary': platform.name === 'SSE',
                  [getTextColor()]: platform.name !== 'SSE',
                })}
              >
                {platform.feePercentage}% fee
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
