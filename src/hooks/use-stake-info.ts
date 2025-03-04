import { useEffect, useState } from "react"
import { useCurrentWallet } from "@/components/auth/hooks/use-current-wallet"

export function useStakeInfo() {
    const [stakeAmount, setStakeAmount] = useState<string>("0")
    const [rewardsAmount, setRewardsAmount] = useState<string>("0")
    const { walletAddress } = useCurrentWallet()
    const [showUserInfoLoading, setShowUserInfoLoading] = useState<boolean>(false)

    useEffect(() => {
        (async () => {
            try {
                if (walletAddress) {
                    setShowUserInfoLoading(true)
                    const response = await fetch(`/api/unstake/userInfo`, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            walletAddy: walletAddress
                        }),
                    })
                    const data = await response.json()
                    const userInfo = data.userInfo
                    setStakeAmount(userInfo.userDeposit)
                    setRewardsAmount(Number(userInfo.rewards).toFixed(2))
                    setShowUserInfoLoading(false)
                }
            } catch (error) {

            }
        })()
    }, [walletAddress])

    return {
        stakeAmount,
        setStakeAmount,
        rewardsAmount,
        setRewardsAmount,
        showUserInfoLoading
    }
}
