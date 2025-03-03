import { useState } from "react"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useCurrentWallet } from "@/components/auth/hooks/use-current-wallet"
import { useTranslations } from "next-intl"
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

export const UnstakeForm = ({
    initialAmount = ''
}: StakeFormProps) => {
    const t = useTranslations()
    const { isLoggedIn, sdkHasLoaded, walletAddress } = useCurrentWallet()
    const [showUnstakeLoading, setShowUnstakeLoading] = useState<boolean>(false)

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

    // Add handler for stake
    const handleUnstake = () => {
        console.log("Staking.....")
    }

    return (
        <div>
            <p className="text-xl font-medium mb-[30px]">{t('trade.select_stake')}</p>
            <div>
                <div className="grid grid-flow-row grid-cols-3 gap-3">
                    <div
                        className="flex flex-col gap-2 bg-green-900/20 rounded-lg border border-green-500/20 hover:border-green-500/50 p-3 cursor-pointer hover:scale-105"
                    >
                        <p>{t('trade.stake')} 1</p>
                        <p className="uppercase text-xl font-medium">2089000 {t('header.terminal.sse')} {t('trade.stake')}</p>
                        <p>{t('trade.unstake_available_in')}</p>
                        <p className="uppercase text-xl font-medium">00D:00H:00M</p>
                    </div>
                    <div
                        className="flex flex-col gap-2 bg-green-900/20 rounded-lg border border-green-500/20 hover:border-green-500/50 p-3 cursor-pointer hover:scale-105"
                    >
                        <p>{t('trade.stake')} 2</p>
                        <p className="uppercase text-xl font-medium">2089000 {t('header.terminal.sse')} {t('trade.stake')}</p>
                        <p>{t('trade.unstake_available_in')}</p>
                        <p className="uppercase text-xl font-medium">00D:00H:00M</p>
                    </div>
                    <div
                        className="flex flex-col gap-2 bg-green-900/20 rounded-lg border border-green-500/20 hover:border-green-500/50 p-3 cursor-pointer hover:scale-105"
                    >
                        <p>{t('trade.stake')} 3</p>
                        <p className="uppercase text-xl font-medium">2089000 {t('header.terminal.sse')} {t('trade.stake')}</p>
                        <p>{t('trade.unstake_available_in')}</p>
                        <p className="uppercase text-xl font-medium">00D:00H:00M</p>
                    </div>
                    <div
                        className="flex flex-col gap-2 bg-green-900/20 rounded-lg border border-green-500/20 hover:border-green-500/50 p-3 cursor-pointer hover:scale-105"
                    >
                        <p>{t('trade.stake')} 4</p>
                        <p className="uppercase text-xl font-medium">2089000 {t('header.terminal.sse')} {t('trade.stake')}</p>
                        <p>{t('trade.unstake_available_in')}</p>
                        <p className="uppercase text-xl font-medium">00D:00H:00M</p>
                    </div>
                </div>
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
                        onClick={handleUnstake}
                        disabled={showUnstakeLoading}
                        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 w-full font-medium"
                    >
                        {showUnstakeLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            t('trade.unstake')
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}