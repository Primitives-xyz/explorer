import tapestryIdl from '@/tapestry-converted.json'
import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import {
  createTransactionErrorResponse,
  serializeTransactionForClient,
} from '@/utils/transaction-helpers'
import * as anchor from '@coral-xyz/anchor'
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

interface FollowWalletRequestBody {
  followerUsername: string
  walletToFollow: string
  followerWallet: string
  namespace?: string
  type?: 'follow' | 'unfollow'
}

// Tapestry Program setup using converted IDL
const getTapestryProgram = () => {
  const PROGRAM_ID = 'GraphUyqhPmEAckWzi7zAvbvUTXf8kqX7JtuvdGYRDRh'
  const connection = new Connection(
    process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
  )
  const EPHEMERAL_KEYPAIR = anchor.web3.Keypair.generate()
  const provider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: EPHEMERAL_KEYPAIR.publicKey,
      signAllTransactions: (transactions) => Promise.resolve(transactions),
      signTransaction: (transaction) => Promise.resolve(transaction),
    },
    { commitment: 'confirmed' }
  )

  // Use converted IDL with proper discriminators for Anchor compatibility
  const program = new anchor.Program(tapestryIdl as any, provider)

  return { program, connection, provider }
}

export async function POST(req: NextRequest) {
  try {
    const {
      followerUsername,
      walletToFollow,
      followerWallet,
      namespace = 'nemoapp',
      type = 'follow',
    }: FollowWalletRequestBody = await req.json()

    if (!followerUsername || !walletToFollow || !followerWallet) {
      return NextResponse.json(
        {
          error:
            'followerUsername, walletToFollow, and followerWallet are required',
        },
        { status: 400 }
      )
    }

    // STEP 1: Resolve wallet to username (existing logic)
    const existingProfile = await fetchTapestryServer({
      endpoint: `profiles?walletAddress=${walletToFollow}`,
      method: FetchMethod.GET,
    })

    let profile = null
    if (existingProfile?.profiles?.[0]) {
      profile = existingProfile.profiles[0]
    } else {
      // No profile exists, create one
      const createAttempt = await fetchTapestryServer({
        endpoint: 'profiles/findOrCreate',
        method: FetchMethod.POST,
        data: {
          username: walletToFollow,
          walletAddress: walletToFollow,
          blockchain: 'SOLANA',
          execution: 'FAST_UNCONFIRMED',
          image: `https://api.dicebear.com/7.x/shapes/svg?seed=${walletToFollow}`,
          properties: [],
        },
      })

      if (!createAttempt) {
        throw new Error('Failed to create profile for wallet')
      }

      profile = createAttempt
    }

    const usernameToFollow = profile?.profile?.username || walletToFollow

    // STEP 2: Get ZK compression data from Tapestry (expensive computation)
    const zkResponse = await fetchTapestryServer({
      endpoint: 'followers/prepare-zk-data',
      method: FetchMethod.POST,
      data: {
        startId: followerUsername,
        endId: usernameToFollow,
        followerWallet,
        namespace,
        type,
      },
    })

    const { zkData } = zkResponse

    // Ensure type property is included for websocket parsing (if not already present)
    const enhancedProperties = [...zkData.properties]
    const hasType = enhancedProperties.find((prop) => prop.key === 'type')
    const hasNamespace = enhancedProperties.find(
      (prop) => prop.key === 'namespace'
    )

    if (!hasType) {
      enhancedProperties.push({ key: 'type', value: type })
    }

    if (!hasNamespace) {
      enhancedProperties.push({ key: 'namespace', value: namespace })
    }

    // STEP 3: Build transaction locally using ZK data + fresh blockhash
    const connection = new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    )

    const userPubkey = new PublicKey(followerWallet)
    const { program } = getTapestryProgram()

    const transaction = new Transaction()

    // Add compute budget instructions for reliable execution
    const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 50000,
    })

    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400522,
    })

    transaction.add(priorityFeeIx, computeBudgetIx)

    // Build the createEdge instruction using zkData
    const proof = {
      a: Array.from(zkData.proof.compressedProof.a),
      b: Array.from(zkData.proof.compressedProof.b),
      c: Array.from(zkData.proof.compressedProof.c),
    }

    const edgeArgs = {
      sourceNode: zkData.followerProfileId,
      targetNode: zkData.followedProfileId,
      properties: enhancedProperties,
      isMutable: true,
    }

    // Convert remaining accounts from zkData
    const remainingAccounts = zkData.remainingAccounts.map(
      (account: string) => ({
        pubkey: new PublicKey(account),
        isSigner: false,
        isWritable: true,
      })
    )

    // Create the follow/unfollow instruction using Tapestry program (same instruction, different properties)
    const followIx = await program.methods
      .createEdge(
        proof,
        zkData.newAddressParamsPacked[0].addressMerkleTreeRootIndex,
        Array.from(zkData.randomBytes),
        edgeArgs
      )
      .accounts({
        payer: userPubkey,
        updateAuthority: userPubkey,
        owner: userPubkey,
        cpiAuthorityPda: new PublicKey(zkData.cpiAuthorityPda),
        selfProgram: new PublicKey(zkData.programId),
        lightSystemProgram: new PublicKey(zkData.lightSystemProgram),
        systemProgram: SystemProgram.programId,
        accountCompressionProgram: new PublicKey(
          zkData.accountCompressionProgram
        ),
        registeredProgramPda: new PublicKey(zkData.registeredProgramPda),
        noopProgram: new PublicKey(zkData.noopProgram),
        accountCompressionAuthority: new PublicKey(
          zkData.accountCompressionAuthority
        ),
      })
      .remainingAccounts(remainingAccounts)
      .instruction()

    transaction.add(followIx)

    // STEP 4: Serialize transaction for frontend signing (with fresh blockhash)
    const serializedTx = await serializeTransactionForClient(
      transaction,
      connection,
      userPubkey
    )

    return NextResponse.json({
      transaction: serializedTx,
      usernameToFollow,
      message: `Sign to ${type} @${usernameToFollow}`,
    })
  } catch (error: any) {
    return createTransactionErrorResponse(error)
  }
}

export const dynamic = 'force-dynamic'
