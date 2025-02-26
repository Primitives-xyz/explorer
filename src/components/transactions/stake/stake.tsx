import { useState } from "react"
import { AmountInput } from "../swap/amount-input"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useCurrentWallet } from "@/components/auth/hooks/use-current-wallet"
import { useTranslations } from "next-intl"
import { BiSolidDownArrow } from "react-icons/bi";
import { BiSolidUpArrow } from "react-icons/bi";
import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

export interface StakeFormProps {
    initialAmount?: string
}

const sseTokenDecimal = 9

export const StakeForm = ({
    initialAmount = ''
}: StakeFormProps) => {
    const t = useTranslations()
    const [displayAmount, setDisplayAmount] = useState(initialAmount)
    const [effectiveAmount, setEffectiveAmount] = useState(initialAmount)
    const [showStakeLoading, setShowStakeLoading] = useState<boolean>(false)
    const [inputError, setInputError] = useState<string | null>(null)
    const [debouncedUpdate, setDebouncedUpdate] = useState<NodeJS.Timeout | null>(
        null
    )
    const [duration, setDuration] = useState<string>("1")
    const [showSummary, setShowSummary] = useState<boolean>(false)

    const { isLoggedIn, sdkHasLoaded, walletAddress } = useCurrentWallet()

    const LoadingDots = () => {
        return (
            <span className="inline-flex items-center">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse animation-delay-200">.</span>
                <span className="animate-pulse animation-delay-400">.</span>
            </span>
        )
    }

    // Add token balance hooks for SSE token
    const {
        balance: inputBalance,
        rawBalance: inputRawBalance,
        loading: inputBalanceLoading,
    } = useTokenBalance(walletAddress, 'So11111111111111111111111111111111111111112')

    const validateAmount = (value: string): boolean => {
        if (value === '') return true

        // Check if the value is a valid number
        const numericValue = Number(value)
        if (isNaN(numericValue)) {
            setInputError(t('error.please_enter_a_valid_number'))
            return false
        }

        // Check if the value is positive
        if (numericValue <= 0) {
            setInputError(t('error.amount_must_be_greater_than_0'))
            return false
        }

        // Check if the value has too many decimal places
        const decimalParts = value.split('.')
        if (
            decimalParts.length > 1 &&
            decimalParts[1]?.length &&
            decimalParts[1]?.length > sseTokenDecimal
        ) {
            setInputError(
                `${t('trade.maximum')} ${sseTokenDecimal} ${t(
                    'trade.decimal_places_allowed'
                )}`
            )
            return false
        }

        setInputError(null)
        return true
    }

    // Utility function to format raw token amounts
    const formatRawAmount = (rawAmount: bigint, decimals: bigint): string => {
        try {
            if (rawAmount === 0n) return '0'

            const divisor = 10n ** decimals
            const integerPart = rawAmount / divisor
            const fractionPart = rawAmount % divisor

            if (fractionPart === 0n) {
                return integerPart.toString()
            }

            // Convert to string and pad with zeros
            let fractionStr = fractionPart.toString()
            while (fractionStr.length < Number(decimals)) {
                fractionStr = '0' + fractionStr
            }

            // Remove trailing zeros
            fractionStr = fractionStr.replace(/0+$/, '')

            return fractionStr
                ? `${integerPart}.${fractionStr}`
                : integerPart.toString()
        } catch (err) {
            console.error('Error formatting amount:', err)
            return '0'
        }
    }

    const handleMaxAmount = () => {
        if (!inputBalance || typeof inputRawBalance !== 'bigint') return

        try {
            const formattedMax = formatRawAmount(
                inputRawBalance,
                BigInt(sseTokenDecimal)
            )

            if (validateAmount(formattedMax)) {
                setDisplayAmount(formattedMax)
                setEffectiveAmount(formattedMax)
                if (debouncedUpdate) clearTimeout(debouncedUpdate)
            }
        } catch (err) {
            console.error('Error calculating max amount:', err)
        }
    }

    // Add handler for staking period selection
    const handleDurationSelection = (period: string) => {
        setDuration(period)
    }

    // Add handlers for quarter, half and max amount
    const handleQuarterAmount = () => {
        if (!inputBalance || typeof inputRawBalance !== 'bigint') return

        try {
            // Calculate quarter of the raw balance using bigint arithmetic
            const quarterAmount = inputRawBalance / 4n
            const formattedQuarter = formatRawAmount(
                quarterAmount,
                BigInt(sseTokenDecimal)
            )

            if (validateAmount(formattedQuarter)) {
                setDisplayAmount(formattedQuarter)
                setEffectiveAmount(formattedQuarter)
                if (debouncedUpdate) clearTimeout(debouncedUpdate)
            }
        } catch (err) {
            console.error('Error calculating quarter amount:', err)
        }
    }

    // Add handler for show summary
    const handleSummaryShow = () => {
        setShowSummary(!showSummary)
    }

    // Add handler for stake
    const handleStake = () => {
        console.log("Staking.....")
    }

    const handleHalfAmount = () => {
        if (!inputBalance || typeof inputRawBalance !== 'bigint') return

        try {
            // Calculate half of the raw balance using bigint arithmetic
            const halfAmount = inputRawBalance / 2n
            const formattedHalf = formatRawAmount(
                halfAmount,
                BigInt(sseTokenDecimal)
            )

            if (validateAmount(formattedHalf)) {
                setDisplayAmount(formattedHalf)
                setEffectiveAmount(formattedHalf)
                if (debouncedUpdate) clearTimeout(debouncedUpdate)
            }
        } catch (err) {
            console.error('Error calculating half amount:', err)
        }
    }

    return (
        <div>
            <AmountInput
                value={displayAmount}
                onChange={setDisplayAmount}
                onEffectiveAmountChange={setEffectiveAmount}
                balance={inputBalance}
                isLoggedIn={isLoggedIn}
                isBalanceLoading={inputBalanceLoading}
                disabled={showStakeLoading}
                error={inputError}
                validateAmount={validateAmount}
                onQuarterClick={handleQuarterAmount}
                onHalfClick={handleHalfAmount}
                onMaxClick={handleMaxAmount}
            />
            <div>
                <div className="text-sm font-medium my-2">Duration</div>
                <div
                    className="flex flex-row justify-between bg-green-900/20 text-2xl p-4 rounded-lg w-full font-medium placeholder:text-green-100/30 transition-all duration-200 outline-none focus:ring-2 focus:ring-green-500/20 border border-green-500/20 focus:border-green-500/30"
                >
                    <span>{duration}</span>
                    <span>months</span>
                </div>
                <div className="flex flex-row justify-start gap-3 items-center my-3">
                    <button
                        onClick={() => { handleDurationSelection("1") }}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md disabled:opacity-50 w-1/6 font-medium"
                    >
                        1m
                    </button>
                    <button
                        onClick={() => { handleDurationSelection("2") }}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md disabled:opacity-50 w-1/6 font-medium"
                    >
                        2m
                    </button>
                    <button
                        onClick={() => { handleDurationSelection("4") }}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md disabled:opacity-50 w-1/6 font-medium"
                    >
                        4m
                    </button>
                    <button
                        onClick={() => { handleDurationSelection("6") }}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md disabled:opacity-50 w-1/6 font-medium"
                    >
                        6m
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-2 border border-green-500/20 rounded-lg p-3">
                <div
                    className="flex flex-row justify-between items-center cursor-pointer"
                    onClick={handleSummaryShow}
                >
                    <span className="font-medium text-[20px] hover:text-green-500">{t('trade.summary')}</span>
                    {
                        showSummary ? (<BiSolidDownArrow />) : (<BiSolidUpArrow />)
                    }

                </div>
                {
                    showSummary && <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <span>{t('trade.stake_date')}</span>
                            <span>{t('02-25-2025')}</span>
                        </div>
                        <div className="flex flex-row justify-between">
                            <span>{t('trade.interest_period')}</span>
                            <span>{`${duration} months`}</span>
                        </div>
                        <div className="flex flex-row justify-between">
                            <span>{t('trade.apy')}</span>
                            <span>35%</span>
                        </div>
                        <div className="flex flex-row justify-between">
                            <span>{t('trade.stake_end_period')}</span>
                            <span>{t('08-25-2025')}</span>
                        </div>
                    </div>
                }
            </div>
            <div className="w-full my-3">
                {!sdkHasLoaded ? (
                    <div className="bg-green-900/20 rounded-lg p-3 border border-green-400/20">
                        <div className="flex items-center justify-center gap-3">
                            <div className="relative w-5 h-5">
                                <div className="absolute inset-0 border-2 border-green-400/20 rounded-full"></div>
                                <div className="absolute inset-0 border-2 border-green-400 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <span className="text-sm font-medium">
                                {t('trade.checking_wallet_status')}
                                <LoadingDots />
                            </span>
                        </div>
                    </div>
                ) : !isLoggedIn ? (
                    <DynamicConnectButton buttonClassName={"w-full"}>
                        <div className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 w-full text-center cursor-pointer font-medium">
                            {t('trade.connect_wallet_to_swap')}
                        </div>
                    </DynamicConnectButton>
                ) : (
                    <button
                        onClick={handleStake}
                        disabled={showStakeLoading}
                        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 w-full font-medium"
                    >
                        {showStakeLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            t('trade.stake')
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}