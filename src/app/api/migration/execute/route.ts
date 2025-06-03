import { SseStake } from '@/new-idl/sse_stake_new'
import newStakingIdl from '@/new-idl/sse_stake_new.json'
import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import fs from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

// SSE token constants
const SSE_TOKEN_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'
const SSE_DECIMALS = 6

// Interface for staking V2 data
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
}

// Function to get staking V2 data for a user
async function getStakingV2Data(
  walletAddress: string
): Promise<StakingV2Data | null> {
  try {
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
      return null
    }

    // Transform the data to our format
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
      fairRewards: parseFloat(userAnalysis.fairRewards) / 1000000 || 0,
      fairRewardsTokens: userAnalysis.fairRewardsTokens || 0,
      actualClaimed: parseFloat(userAnalysis.actualClaimed) / 1000000 || 0,
      actualClaimedTokens: userAnalysis.actualClaimedTokens || 0,
      status: userAnalysis.status || 'correctly-claimed',
    }

    return stakingV2Data
  } catch (error) {
    console.error('Error fetching staking V2 data:', error)
    return null
  }
}

// Function to calculate total claimable reward amount
function calculateTotalClaimable(stakingData: StakingV2Data | null): number {
  const loyaltyReward = 100
  const unclaimedRewards =
    stakingData && stakingData.status === 'under-claimed'
      ? Math.abs(stakingData.overClaimed || 0)
      : 0
  return loyaltyReward + unclaimedRewards
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      )
    }

    // Get the payer's keypair from environment variable
    const PAYER_PRIVATE_KEY = process.env.SSE_STAKE_FEE_PAYER
    if (!PAYER_PRIVATE_KEY) {
      throw new Error('PAYER_PRIVATE_KEY is not set')
    }
    const secretKey = bs58.decode(PAYER_PRIVATE_KEY)
    const payerKeypair = Keypair.fromSecretKey(secretKey)

    console.log('payerKeypair', payerKeypair.publicKey.toBase58())

    // Get staking V2 data to calculate proper reward amount
    const stakingData = await getStakingV2Data(walletAddress)
    const totalClaimableSSE = calculateTotalClaimable(stakingData)
    const SSE_TRANSFER_AMOUNT = Math.floor(
      totalClaimableSSE * Math.pow(10, SSE_DECIMALS)
    )

    console.log('Staking V2 Data:', stakingData)
    console.log('Total claimable SSE:', totalClaimableSSE)
    console.log('Transfer amount (raw):', SSE_TRANSFER_AMOUNT)

    // Initialize connection
    const connection = new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    )

    // Create a dummy wallet for Anchor provider (won't be used for signing)
    const dummyPayer = Keypair.generate()
    const wallet = new NodeWallet(dummyPayer)
    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: 'confirmed',
    })
    anchor.setProvider(provider)

    // Initialize the program with the new IDL
    const program = new anchor.Program(
      newStakingIdl as anchor.Idl,
      provider
    ) as anchor.Program<SseStake>

    const userPubkey = new PublicKey(walletAddress)
    const sseTokenMint = new PublicKey(SSE_TOKEN_MINT)

    // Get associated token accounts
    const payerTokenAccount = await getAssociatedTokenAddress(
      sseTokenMint,
      payerKeypair.publicKey
    )
    const userTokenAccount = await getAssociatedTokenAddress(
      sseTokenMint,
      userPubkey
    )

    // Create migration instruction using Anchor
    const migrationIx = await program.methods
      .migrateAccount()
      .accounts({
        user: userPubkey,
      })
      .transaction()

    // Start building the transaction with all instructions
    const instructions = [...migrationIx.instructions]

    // Check if user's token account exists, create if not
    const userTokenAccountInfo = await connection.getAccountInfo(
      userTokenAccount
    )
    if (!userTokenAccountInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          userPubkey, // payer (user will pay for their own ATA)
          userTokenAccount,
          userPubkey, // owner
          sseTokenMint
        )
      )
    }

    // Create transfer instruction to send calculated SSE reward
    const transferInstruction = createTransferInstruction(
      payerTokenAccount,
      userTokenAccount,
      payerKeypair.publicKey,
      BigInt(SSE_TRANSFER_AMOUNT),
      [],
      TOKEN_PROGRAM_ID
    )
    instructions.push(transferInstruction)

    // Create the final transaction with all instructions
    migrationIx.instructions = instructions
    migrationIx.feePayer = userPubkey
    migrationIx.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash

    // Partially sign the transaction with the payer keypair for the transfer instruction
    migrationIx.partialSign(payerKeypair)

    // Serialize the partially signed transaction
    const serializedTx = migrationIx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })

    // Convert to base64
    const serializedTxAsString = Buffer.from(serializedTx).toString('base64')

    console.log(
      `Returning serialized migration transaction with ${totalClaimableSSE} SSE transfer.`
    )
    return NextResponse.json({
      transaction: serializedTxAsString,
      message: `Migration transaction created successfully with ${totalClaimableSSE} SSE transfer (${
        stakingData?.status === 'under-claimed'
          ? `100 SSE loyalty + ${Math.abs(
              stakingData?.overClaimed || 0
            )} SSE unclaimed rewards`
          : '100 SSE loyalty bonus'
      })`,
      rewardBreakdown: {
        loyaltyBonus: 100,
        unclaimedRewards:
          stakingData?.status === 'under-claimed'
            ? Math.abs(stakingData?.overClaimed || 0)
            : 0,
        totalSSE: totalClaimableSSE,
        status: stakingData?.status || 'unknown',
      },
    })
  } catch (error) {
    console.error('Migration API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create migration transaction',
      },
      { status: 500 }
    )
  }
}
