import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'

// Old IDL imports
import { SseStake as OldSseStake } from '@/sse-staking'
import oldStakingIdl from '@/sse_stake.json'

// New IDL imports
import { SseStake as NewSseStake } from '@/new-idl/sse_stake_new'
import newStakingIdl from '@/new-idl/sse_stake_new.json'

const PROGRAM_ID = new PublicKey('sseobVr99LLaERn6JvFDC7E9EjYFdP4ggpM51P9XBHJ')
const SEED_CONFIG = 'config'
const SEED_USERINFO = 'userinfo'

export interface StakingVersion {
  isNewVersion: boolean
  program: anchor.Program<OldSseStake> | anchor.Program<NewSseStake>
  configPda: PublicKey
  userInfoPda: PublicKey
}

export async function detectStakingVersion(
  connection: Connection,
  userWallet: PublicKey
): Promise<StakingVersion> {
  // Find user info PDA
  const [userInfoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_USERINFO), userWallet.toBytes()],
    PROGRAM_ID
  )

  // Find config PDA
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    PROGRAM_ID
  )

  // Check if account exists and its size
  const accountInfo = await connection.getAccountInfo(userInfoPda)

  // Determine version based on account size
  // Old accounts are 65 bytes, new accounts are larger
  const isNewVersion = !accountInfo || accountInfo.data.length > 65

  // Create a dummy wallet for Anchor provider (for reading)
  const dummyPayer = Keypair.generate()
  const wallet = new NodeWallet(dummyPayer)
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  })
  anchor.setProvider(provider)

  // Initialize the appropriate program
  const program = isNewVersion
    ? (new anchor.Program(
        newStakingIdl as anchor.Idl,
        provider
      ) as anchor.Program<NewSseStake>)
    : (new anchor.Program(
        oldStakingIdl as anchor.Idl,
        provider
      ) as anchor.Program<OldSseStake>)

  return {
    isNewVersion,
    program,
    configPda,
    userInfoPda,
  }
}

// Helper to get field names based on version
export function getFieldNames(isNewVersion: boolean) {
  return {
    // Config fields
    totalRate: isNewVersion ? 'totalRate' : 'totalRate',
    claimPeriod: isNewVersion ? 'claimPeriod' : 'claimPeriod',
    lastRewardTime: isNewVersion ? 'lastRewardTime' : 'lastRewardTime',
    totalDeposit: isNewVersion ? 'totalDeposit' : 'totalDeposit',
    rewardMultiplier: isNewVersion ? 'rewardMultiplier' : 'rewardMultiplier',

    // User fields
    deposit: isNewVersion ? 'deposit' : 'deposit',
    debt: isNewVersion ? 'debt' : 'debt',
    lastUpdate: isNewVersion ? 'lastUpdate' : 'lastUpdate',
    initialized: isNewVersion ? 'initialized' : 'initialized',

    // Method names
    stake: isNewVersion ? 'stake' : 'stake',
    unstake: isNewVersion ? 'unstake' : 'unstake',
    claimReward: isNewVersion ? 'claimReward' : 'claimReward',
  }
}
