import { fetchTokenInfo } from '@/utils/helius/das-api'
import { Connection, PublicKey } from '@solana/web3.js'

/**
 * Find tokens created by a specific wallet address.
 * This uses a two-step process:
 * 1. Find accounts from our target program that reference the wallet
 * 2. Extract the mint pubkey from the account data and fetch its details
 */
async function findTribeTokenByCreator(creatorAddress: string): Promise<void> {
  // Initialize RPC connection
  const HELIUS_RPC =
    'https://mainnet.helius-rpc.com/?api-key=f30d6a96-5fa2-4318-b2da-0f6d1deb5c83'
  const connection = new Connection(HELIUS_RPC, 'confirmed')

  // Define constants
  const programPubkey = new PublicKey(
    'HVdfohHjp1kZwxn123Cxv3GDeXeXnLM1RAXaF8dPYBdS'
  )
  const OFFSET_TO_CREATOR = 24 // Known offset where creator pubkey is stored
  const OFFSET_TO_MINT = 56 // Known offset where mint pubkey is stored

  try {
    // Step 1: Find program accounts associated with our creator
    const accounts = await connection.getProgramAccounts(programPubkey, {
      filters: [
        {
          memcmp: {
            offset: OFFSET_TO_CREATOR,
            bytes: creatorAddress,
          },
        },
      ],
    })

    // Extract the mint address from the account data
    const accountData = accounts[0].account.data

    // Step 2: Get the mint address and query the Helius API for token details
    const mintPubkey = new PublicKey(
      accountData.slice(OFFSET_TO_MINT, OFFSET_TO_MINT + 32)
    )
    const response = await fetchTokenInfo(mintPubkey.toString())
    if (!response) {
      console.log(`Could not fetch details for token: ${mintPubkey.toString()}`)
      return
    }
    const { result } = response

    // Extract and display the token information

    const tokenName = result?.metadata?.name || 'Unknown'
    const tokenSymbol = result?.metadata?.symbol || 'Unknown'

    console.log('\n----------------------------------------')
    console.log(`✨ Creator: ${creatorAddress}`)
    console.log(`🪙 Created Token: ${tokenName} (${tokenSymbol})`)
    console.log(`💎 Mint Address: ${mintPubkey.toString()}`)
    console.log(
      `👤 Creator Profile: https://www.tribe.run/user/${creatorAddress}`
    )
    console.log('----------------------------------------\n')
    console.timeEnd('Execution time')
  } catch (error) {
    console.error('Error while looking up token:', error)
  }
}

// Execute with our target wallet address
findTribeTokenByCreator('Ahh3imDB9NFjYp2niRpgYPoGwJmhkFPA4Rk89rb5jeek')
