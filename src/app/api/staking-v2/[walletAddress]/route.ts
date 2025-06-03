import fs from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

interface StakingV2Data {
  totalTransactions: number
  creditsEarned: number
  overClaimed?: number
  finalCredits: number
  currentStake: number
  totalStaked: number
  totalUnstaked: number
  totalRewardsClaimed: number
  fairRewards: number
  fairRewardsTokens: number
  actualClaimed: number
  actualClaimedTokens: number
  status: 'over-claimed' | 'under-claimed' | 'correctly-claimed'
  details?: {
    stakingHistory: Array<{
      date: string
      amount: number
      type: 'stake' | 'unstake' | 'reward'
    }>
    claimedAmount: number
    actualEarnings: number
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await context.params

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Read the JSON file
    const jsonPath = path.join(
      process.cwd(),
      'public/data/complete-efficient-analysis.json'
    )
    const jsonData = await fs.readFile(jsonPath, 'utf8')
    const data = JSON.parse(jsonData)

    // Find the user's data in the fairDistribution.userAnalysis array
    const userAnalysis = data.fairDistribution?.userAnalysis?.find(
      (user: any) => user.user.toLowerCase() === walletAddress.toLowerCase()
    )

    if (!userAnalysis) {
      return NextResponse.json(
        { error: 'No staking data found for this wallet' },
        { status: 404 }
      )
    }

    // Find the user's timeline data
    const userTimeline = data.userTimelines?.find(
      (timeline: any) =>
        timeline.user.toLowerCase() === walletAddress.toLowerCase()
    )

    // Transform the data to our format - using the exact field names from JSON
    const stakingV2Data: StakingV2Data = {
      totalTransactions: userAnalysis.timeline?.activitiesCount || 0,
      creditsEarned: userAnalysis.fairRewardsTokens || 0,
      overClaimed:
        userAnalysis.status === 'over-claimed'
          ? userAnalysis.differenceTokens || 0
          : userAnalysis.status === 'under-claimed'
          ? -(userAnalysis.differenceTokens || 0)
          : 0,
      finalCredits: userAnalysis.fairRewardsTokens || 0,
      currentStake: userAnalysis.timeline?.currentStakeTokens || 0,
      totalStaked: userAnalysis.timeline?.totalStakedTokens || 0,
      totalUnstaked: userAnalysis.timeline?.totalUnstakedTokens || 0,
      totalRewardsClaimed:
        userAnalysis.timeline?.totalRewardsClaimedTokens || 0,
      fairRewards: parseFloat(userAnalysis.fairRewards) / 1000000 || 0, // Convert raw amount to tokens
      fairRewardsTokens: userAnalysis.fairRewardsTokens || 0,
      actualClaimed: parseFloat(userAnalysis.actualClaimed) / 1000000 || 0, // Convert raw amount to tokens
      actualClaimedTokens: userAnalysis.actualClaimedTokens || 0,
      status: userAnalysis.status || 'correctly-claimed',
    }

    // Add activity history if available
    if (userTimeline?.activities && userTimeline.activities.length > 0) {
      stakingV2Data.details = {
        stakingHistory: userTimeline.activities.map((activity: any) => ({
          date: activity.date,
          amount:
            activity.stakeAmountTokens ||
            activity.unstakeAmountTokens ||
            activity.claimAmountTokens ||
            0,
          type: activity.type as 'stake' | 'unstake' | 'reward',
        })),
        claimedAmount: userAnalysis.actualClaimedTokens || 0,
        actualEarnings: userAnalysis.fairRewardsTokens || 0,
      }
    }

    return NextResponse.json(stakingV2Data)
  } catch (error) {
    console.error('Error fetching staking V2 data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staking V2 data' },
      { status: 500 }
    )
  }
}
