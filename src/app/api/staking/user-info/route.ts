import { detectStakingVersion } from '@/utils/staking-version'
import * as anchor from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'
// CRITICAL FIX: Use correct precision matching the contract and getUserInfo script
const PRECISION = BigInt(1e12)
const TOKEN_DECIMALS = BigInt(1e6)

// Helper functions for BigInt precision safety (matching getUserInfo exactly)
function bnToBigInt(bn: anchor.BN): bigint {
  return BigInt(bn.toString())
}

function bigIntToDisplayNumber(value: bigint, decimals = 6): number {
  return Number(value) / Math.pow(10, decimals)
}

// Calculate current reward rate with BigInt precision (exact getUserInfo logic)
function calculateGlobalRate(configAccount: any): number {
  const currentRewardRateBig = bnToBigInt(
    configAccount.currentRewardRate || new anchor.BN(0)
  )
  const rewardMultiplierBig = bnToBigInt(configAccount.rewardMultiplier)

  if (currentRewardRateBig > 0n) {
    // Sustainable system: currentRewardRate is scaled, convert to tokens per second
    return (
      Number(currentRewardRateBig) / Number(PRECISION) / Number(TOKEN_DECIMALS)
    )
  } else {
    // Legacy system fallback
    return Number(rewardMultiplierBig) / Number(TOKEN_DECIMALS)
  }
}

// Calculate user's share percentage with BigInt precision
function calculateUserShare(
  userDeposit: anchor.BN,
  totalDeposit: anchor.BN
): number {
  const userDepositBig = bnToBigInt(userDeposit)
  const totalDepositBig = bnToBigInt(totalDeposit)

  if (totalDepositBig === 0n) return 0

  // Calculate with high precision then convert for display
  const shareRatio = (userDepositBig * BigInt(10000)) / totalDepositBig
  return Number(shareRatio) / 100
}

// Calculate claimable rewards with BigInt precision (exact getUserInfo logic)
function calculateClaimableRewards(
  configAccount: any,
  userAccount: any,
  currentTime: number
): {
  globalRate: number
  userRewardRate: number
  claimableAmount: bigint
  accPerShare: bigint
  rawRewards: bigint
  systemType: string
} {
  const currentRewardRateBig = bnToBigInt(
    configAccount.currentRewardRate || new anchor.BN(0)
  )
  const totalDepositBig = bnToBigInt(configAccount.totalDeposit)
  const userDepositBig = bnToBigInt(userAccount.deposit)
  const userDebtBig = bnToBigInt(userAccount.debt)
  const lastRewardTimeBig = bnToBigInt(configAccount.lastRewardTime)
  const totalRateBig = bnToBigInt(configAccount.totalRate)

  let accPerShare = totalRateBig
  const systemType = currentRewardRateBig > 0n ? 'Sustainable' : 'Legacy'

  // Calculate global rate for display
  const globalRate = calculateGlobalRate(configAccount)

  if (
    currentTime > Number(lastRewardTimeBig) &&
    totalDepositBig > 0n &&
    currentRewardRateBig > 0n
  ) {
    // Calculate new rewards accumulated since last update
    const timeDiffBig = BigInt(currentTime - Number(lastRewardTimeBig))
    const totalRewardsThisPeriod =
      (currentRewardRateBig * timeDiffBig) / PRECISION
    const increment = (totalRewardsThisPeriod * PRECISION) / totalDepositBig

    accPerShare = totalRateBig + increment
  }

  // Calculate raw rewards: (deposit * accPerShare) / PRECISION
  const rawRewards = (userDepositBig * accPerShare) / PRECISION

  // Calculate claimable: rawRewards - debt
  let claimableAmount = 0n
  if (rawRewards > userDebtBig) {
    claimableAmount = rawRewards - userDebtBig
  }

  // Calculate user reward rate
  const userRewardRate =
    totalDepositBig > 0n
      ? (Number(userDepositBig) / Number(totalDepositBig)) * globalRate
      : 0

  return {
    globalRate,
    userRewardRate,
    claimableAmount,
    accPerShare,
    rawRewards,
    systemType,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, walletAddy } = await request.json()

    // Support both field names for backward compatibility
    const userWallet = walletAddress || walletAddy
    if (!userWallet) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      )
    }

    // Parse the public key string
    let userPubkey: PublicKey
    try {
      userPubkey = new PublicKey(userWallet)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid public key format' },
        { status: 400 }
      )
    }

    // Initialize connection
    const connection = new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    )

    // Detect which version to use
    const { isNewVersion, program, configPda, userInfoPda } =
      await detectStakingVersion(connection, userPubkey)

    console.log(
      `Using ${isNewVersion ? 'new' : 'old'} staking contract for user info`
    )

    try {
      // Fetch config account
      const configAccount = await program.account.config.fetch(configPda)

      // Fetch user account
      const userAccount = await program.account.user.fetch(userInfoPda)

      // Get current timestamp - use system time as it's more reliable
      const currentTime = Math.floor(Date.now() / 1000)

      console.log('Debug timestamps:', {
        currentTime,
        lastRewardTime: configAccount.lastRewardTime.toNumber(),
        totalDeposit: configAccount.totalDeposit.toNumber(),
        isNewVersion,
      })

      // Calculate rewards using BigInt precision (exact getUserInfo logic)
      const rewardCalc = calculateClaimableRewards(
        configAccount,
        userAccount,
        currentTime
      )
      const userShare = calculateUserShare(
        userAccount.deposit,
        configAccount.totalDeposit
      )

      // Convert amounts to token units using BigInt precision
      const totalDepositBig = bnToBigInt(configAccount.totalDeposit)
      const userDepositBig = bnToBigInt(userAccount.deposit)
      const userDebtBig = bnToBigInt(userAccount.debt)

      const depositInTokens = bigIntToDisplayNumber(userDepositBig, 6)
      const claimableInTokens = bigIntToDisplayNumber(
        rewardCalc.claimableAmount,
        6
      )
      const totalDepositInTokens = bigIntToDisplayNumber(totalDepositBig, 6)

      console.log('BigInt precision calculations:', {
        userDepositRaw: userAccount.deposit.toString(),
        depositInTokens,
        totalDepositRaw: configAccount.totalDeposit.toString(),
        totalDepositInTokens,
        claimableInTokens,
        claimableRaw: rewardCalc.claimableAmount.toString(),
        systemType: rewardCalc.systemType,
        globalRate: rewardCalc.globalRate,
      })

      // Calculate earning rates exactly like getUserInfo
      const earningRates = {
        perSecond: rewardCalc.userRewardRate,
        perHour: rewardCalc.userRewardRate * 3600,
        perDay: rewardCalc.userRewardRate * 86400,
        canEarnRewards: rewardCalc.userRewardRate > 0,
      }

      console.log('Earning rates calculation:', {
        globalRate: rewardCalc.globalRate,
        userRewardRate: rewardCalc.userRewardRate,
        earningRates,
      })

      // Return the user info in a format compatible with the frontend
      // Support both old and new response formats
      const response: any = {
        userInfo: {
          userDeposit: depositInTokens.toFixed(6),
          rewards: claimableInTokens.toFixed(6),
          totalDeposit: totalDepositInTokens.toFixed(6),
          // Additional fields for debugging/display
          rawDeposit: userAccount.deposit.toString(),
          rawDebt: userAccount.debt.toString(),
          lastUpdate: userAccount.lastUpdate.toString(),
          initialized: userAccount.initialized,
          // Config info
          totalRate: configAccount.totalRate.toString(),
          rewardMultiplier: configAccount.rewardMultiplier.toString(),
          lastRewardTime: configAccount.lastRewardTime.toString(),
          // Enhanced info from getUserInfo (with BigInt precision)
          systemType: rewardCalc.systemType,
          effectiveRewardRate: rewardCalc.globalRate.toFixed(9),
          earningRates: {
            perSecond: earningRates.perSecond.toFixed(9),
            perHour: earningRates.perHour.toFixed(6),
            perDay: earningRates.perDay.toFixed(6),
            canEarnRewards: earningRates.canEarnRewards,
          },
          // User share percentage (fixed precision like getUserInfo)
          userSharePercentage: userShare.toFixed(8),
          // Version info
          isNewVersion,
          // BigInt precision debug info
          accPerShare: rewardCalc.accPerShare.toString(),
          rawRewards: rewardCalc.rawRewards.toString(),
        },
      }

      // Add version-specific fields
      if (isNewVersion) {
        // For new version, access fields directly from configAccount
        response.userInfo.currentRewardRate = (
          (configAccount as any).currentRewardRate || new anchor.BN(0)
        ).toString()
        if ((configAccount as any).distributionPeriod) {
          response.userInfo.distributionPeriod = (
            configAccount as any
          ).distributionPeriod.toString()
        }
        if ((configAccount as any).emergencyReserveBp) {
          response.userInfo.emergencyReserveBp = (
            configAccount as any
          ).emergencyReserveBp.toString()
        }
      } else {
        // Add old format fields for backward compatibility
        response.userInfo.times = currentTime * 1000 // milliseconds
        response.userInfo.claimPeriod = configAccount.claimPeriod.toString()
      }

      return NextResponse.json(response)
    } catch (error: any) {
      if (error.message?.includes('Account does not exist')) {
        // User has not staked yet
        console.log('User account not found - user has not staked yet')
        return NextResponse.json({
          userInfo: {
            userDeposit: '0.000000',
            rewards: '0.000000',
            totalDeposit: '0.000000',
            earningRates: {
              perSecond: '0.000000000',
              perHour: '0.000000',
              perDay: '0.000000',
              canEarnRewards: false,
            },
            userSharePercentage: '0.00000000',
            systemType: 'Unknown',
            isNewVersion: false,
          },
        })
      } else {
        console.error('Error fetching account data:', error)
        throw error
      }
    }
  } catch (error) {
    console.error('Staking user info API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch staking info',
      },
      { status: 500 }
    )
  }
}
