import { Connection } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

interface SubmitTransactionRequestBody {
  transaction: string // base64 encoded signed transaction
}

export async function POST(req: NextRequest) {
  try {
    const { transaction }: SubmitTransactionRequestBody = await req.json()

    if (!transaction) {
      return NextResponse.json(
        { error: 'transaction is required' },
        { status: 400 }
      )
    }

    const RPC_URL = process.env.RPC_URL
    if (!RPC_URL) {
      return NextResponse.json(
        { error: 'RPC configuration missing' },
        { status: 500 }
      )
    }

    console.log('Submitting transaction via server RPC:', RPC_URL)

    const connection = new Connection(RPC_URL, {
      commitment: 'confirmed',
    })

    // Test connection
    const slot = await connection.getSlot()
    console.log('Server RPC current slot:', slot)

    // Parse transaction for debugging (but don't modify it!)
    const transactionBuffer = Buffer.from(transaction, 'base64')
    console.log('Transaction buffer length:', transactionBuffer.length)

    // Verify we're not modifying the transaction
    console.log('=== SERVER BLOCKHASH VERIFICATION ===')

    try {
      const { VersionedTransaction } = await import('@solana/web3.js')
      const parsedTx = VersionedTransaction.deserialize(transactionBuffer)

      console.log(
        'Received transaction blockhash:',
        parsedTx.message.recentBlockhash
      )
      console.log('This should match what frontend signed with')

      // Check if the transaction blockhash is still valid
      console.log('Checking blockhash validity...')
      const currentBlockhash = await connection.getLatestBlockhash()
      console.log('Current network blockhash:', currentBlockhash.blockhash)
      console.log('Current slot:', await connection.getSlot())
      console.log(
        'Last valid block height:',
        currentBlockhash.lastValidBlockHeight
      )

      // If blockhashes are different, check if transaction blockhash is too old
      if (parsedTx.message.recentBlockhash !== currentBlockhash.blockhash) {
        console.warn(
          '⚠️ Transaction blockhash differs from current network blockhash'
        )

        // Try to check if the transaction blockhash is still within valid range
        // This is an approximation since we don't have the exact block height for the transaction blockhash
        const currentSlot = await connection.getSlot()
        const blockheightDiff =
          currentSlot - currentBlockhash.lastValidBlockHeight

        console.log('Estimated block height difference:', blockheightDiff)

        if (blockheightDiff > 0) {
          console.error('❌ Transaction blockhash appears to be expired')
          return NextResponse.json(
            {
              error: 'Transaction blockhash expired',
              details:
                'Transaction was created too long ago and blockhash is no longer valid',
              transactionBlockhash: parsedTx.message.recentBlockhash,
              currentBlockhash: currentBlockhash.blockhash,
              suggestion:
                'Please retry the transaction to get a fresh blockhash',
            },
            { status: 400 }
          )
        } else {
          console.log(
            'Transaction blockhash appears to still be valid (within range)'
          )
        }
      } else {
        console.log(
          '✅ Transaction blockhash matches current network blockhash'
        )
      }

      console.log('Transaction details:', {
        signatures: parsedTx.signatures.map((sig) =>
          sig ? 'present' : 'null'
        ),
        numRequiredSignatures: parsedTx.message.header.numRequiredSignatures,
        recentBlockhash: parsedTx.message.recentBlockhash,
        accountKeys: parsedTx.message.staticAccountKeys.length,
        instructions: parsedTx.message.compiledInstructions.length,
      })

      // Check if all required signatures are present
      const validSignatures = parsedTx.signatures.filter(
        (sig) => sig && sig.some((byte) => byte !== 0)
      )

      console.log(
        `Valid signatures: ${validSignatures.length}/${parsedTx.message.header.numRequiredSignatures}`
      )

      if (
        validSignatures.length !== parsedTx.message.header.numRequiredSignatures
      ) {
        return NextResponse.json(
          { error: 'Transaction missing required signatures' },
          { status: 400 }
        )
      }

      // Simulate the transaction as-is (don't modify it!)
      console.log('Simulating transaction...')
      const simulation = await connection.simulateTransaction(parsedTx, {
        sigVerify: false, // Don't verify signatures during simulation
        replaceRecentBlockhash: true, // Let simulation use current blockhash for testing
      })

      console.log('Simulation result:', {
        err: simulation.value.err,
        logs: simulation.value.logs?.slice(-3),
      })

      if (simulation.value.err) {
        console.error('Transaction simulation failed:', simulation.value.err)
        return NextResponse.json(
          {
            error: 'Transaction would fail',
            simulationError: simulation.value.err,
            logs: simulation.value.logs,
          },
          { status: 400 }
        )
      }
    } catch (parseError) {
      console.error('Failed to parse transaction:', parseError)
      return NextResponse.json(
        { error: 'Invalid transaction format' },
        { status: 400 }
      )
    }

    // Submit the original signed transaction without any modifications
    console.log('Submitting original signed transaction...')

    // Final verification - confirm we're submitting the EXACT original transaction
    console.log('=== FINAL SERVER SUBMISSION VERIFICATION ===')
    const { VersionedTransaction: FinalVersionedTransaction } = await import(
      '@solana/web3.js'
    )
    const finalParsedTx =
      FinalVersionedTransaction.deserialize(transactionBuffer)
    console.log(
      'About to submit transaction with blockhash:',
      finalParsedTx.message.recentBlockhash
    )
    console.log('This MUST match the blockhash from frontend signing')

    try {
      const signature = await connection.sendRawTransaction(transactionBuffer, {
        skipPreflight: true,
        maxRetries: 3,
        preflightCommitment: 'processed',
      })

      console.log('Transaction submitted, signature:', signature)

      // Check if signature looks valid
      if (
        signature ===
        '1111111111111111111111111111111111111111111111111111111111111111'
      ) {
        throw new Error('Received invalid signature from RPC')
      }

      // Wait for confirmation with multiple attempts
      console.log('Waiting for confirmation...')

      let confirmed = false
      const maxAttempts = 30 // 30 seconds max

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

        try {
          const status = await connection.getSignatureStatus(signature, {
            searchTransactionHistory: true,
          })

          console.log(`Confirmation attempt ${attempt}:`, status.value)

          if (status.value !== null) {
            if (status.value.err) {
              console.error('Transaction failed on-chain:', status.value.err)
              return NextResponse.json(
                {
                  error: 'Transaction failed on blockchain',
                  signature,
                  onChainError: status.value.err,
                },
                { status: 400 }
              )
            } else {
              console.log('✅ Transaction confirmed successfully!')
              confirmed = true
              break
            }
          }
        } catch (statusError) {
          console.log(`Status check ${attempt} failed:`, statusError)
        }
      }

      if (!confirmed) {
        console.warn(
          'Transaction not confirmed within timeout, but may still be valid'
        )
        // Don't fail - return the signature anyway
      }

      // Additional debugging - try to fetch some recent network activity
      console.log('=== NETWORK CONNECTIVITY CHECK ===')
      try {
        const recentSlot = await connection.getSlot()
        console.log('Network appears responsive, current slot:', recentSlot)

        // Try to get recent signatures for a known active account (ComputeBudget program)
        const { PublicKey } = await import('@solana/web3.js')
        const computeBudgetPubkey = new PublicKey(
          'ComputeBudget111111111111111111111111111111'
        )
        const recentSignatures = await connection.getSignaturesForAddress(
          computeBudgetPubkey,
          { limit: 3 }
        )

        if (recentSignatures.length > 0) {
          console.log(
            `Found ${recentSignatures.length} recent signatures on network`
          )
          console.log('Most recent signature:', recentSignatures[0].signature)
          console.log('Network seems to be processing transactions normally')
        } else {
          console.warn(
            'No recent signatures found - network might be having issues'
          )
        }
      } catch (networkError: any) {
        console.error(
          'Network connectivity check failed:',
          networkError.message
        )
      }

      return NextResponse.json({
        signature,
        slot,
        rpcEndpoint: connection.rpcEndpoint,
        confirmed,
      })
    } catch (submitError: any) {
      console.error('Transaction submission failed:', submitError)
      return NextResponse.json(
        { error: `Submission failed: ${submitError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in transaction submission:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
