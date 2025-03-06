import { SseStake } from '@/sse-staking'
import stakingProgramIdl from '@/sse_stake.json'
import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

function getMultiplier(
  from: number,
  to: number,
  rewardMultiplier: number
): number {
  console.log('getMultiplier:: from:', from, 'to:', to)
  if (to < from) {
    throw new Error(
      "Invalid value: 'to' must be greater than or equal to 'from'"
    )
  }
  const duration: number = to - from
  const result: number = duration * rewardMultiplier
  console.log(
    'getMultiplier:: duration:',
    duration,
    'rewardMultiplier:',
    rewardMultiplier,
    'result:',
    result
  )
  return result
}
const getUserInfo = (
  userDeposit: number,
  userDebt: number,
  timeStamp: number,
  totalRate: number,
  claimPeriod: number,
  lastRewardTime: number,
  totalDeposit: number,
  rewardMultiplier: number
) => {
  let accPerShare: number = totalRate

  console.log('calcReward: accPerShare:', accPerShare, 'totalRate:', totalRate)

  const nTimeStamp = Math.floor(timeStamp / claimPeriod) * claimPeriod

  console.log(
    'nTimeStamp:',
    nTimeStamp,
    'claimPeriod:',
    claimPeriod,
    'accPerShare:',
    accPerShare
  )

  if (nTimeStamp > lastRewardTime && totalDeposit !== 0) {
    const nMultiplier = getMultiplier(
      lastRewardTime,
      nTimeStamp,
      rewardMultiplier
    )

    console.log(
      'nMultiplier:',
      nMultiplier,
      'lastRewardTime:',
      lastRewardTime,
      'nTimeStamp:',
      nTimeStamp
    )

    accPerShare = accPerShare + nMultiplier / totalDeposit

    console.log('Updated accPerShare:', accPerShare)
  }

  const rewards = userDeposit * accPerShare - userDebt
  console.log(
    'Result:',
    rewards,
    'User Deposit:',
    userDeposit,
    'User Debt:',
    userDebt
  )

  const divisor = 10 ** 6

  return {
    userDeposit: (userDeposit / divisor).toString(),
    rewards: (rewards / divisor).toString(),
  }
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddy } = await req.json()
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
    const wallet = new NodeWallet(Keypair.generate())
    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: 'confirmed',
    })
    anchor.setProvider(provider)
    const stakingProgramInterface = JSON.parse(
      JSON.stringify(stakingProgramIdl)
    )
    const program = new anchor.Program(
      stakingProgramInterface,
      provider
    ) as anchor.Program<SseStake>

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      program.programId
    )

    const [userInfoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('userinfo'), new PublicKey(walletAddy).toBytes()],
      program.programId
    )

    const configAccount = await program.account.config.fetch(configPda)
    const userInfoAccount = await program.account.user.fetch(userInfoPda)

    console.log('userInfoAccount: ', userInfoAccount)

    const slot = await provider.connection.getSlot('confirmed')
    const blockTime = await provider.connection.getBlockTime(slot)

    if (blockTime) {
      const userDeposit = userInfoAccount.deposit.toNumber()
      const userDebt = userInfoAccount.debt.toNumber()
      const totalRate = configAccount.totalRate
      const claimPeriod = configAccount.claimPeriod.toNumber()
      const lastRewardTime = configAccount.lastRewardTime.toNumber()
      const totalDeposit = configAccount.totalDeposit.toNumber()
      const rewardMultiplier = configAccount.rewardMultiplier.toNumber()

      const userInfo = getUserInfo(
        userDeposit,
        userDebt,
        blockTime,
        totalRate,
        claimPeriod,
        lastRewardTime,
        totalDeposit,
        rewardMultiplier
      )

      return NextResponse.json({ userInfo })
    } else {
      return NextResponse.json({ error: String('Error in blocktime fetch') })
    }
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: String(err) })
  }
}
