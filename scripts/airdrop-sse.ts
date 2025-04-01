// Example client for the airdrop API
// This is a demonstration of how to call the airdrop API from the frontend
// import walletData from './opinions_sse_wallets.json'

// Define the wallet data type
interface WalletItem {
  wallet_address: string
}

/**
 * Function to trigger a token airdrop to multiple wallets
 * @param walletAddresses Array of wallet addresses to airdrop tokens to
 * @param amounts Array of token amounts (in base units, e.g., lamports) for each wallet
 * @param priorityLevel Optional priority level for the transaction
 * @returns The API response with transaction signatures
 */
export async function triggerAirdrop(
  walletAddresses: string[],
  amounts: string[],
  priorityLevel:
    | 'Min'
    | 'Low'
    | 'Medium'
    | 'High'
    | 'VeryHigh'
    | 'UnsafeMax' = 'Medium'
) {
  if (walletAddresses.length !== amounts.length) {
    throw new Error(
      'walletAddresses and amounts arrays must have the same length'
    )
  }

  try {
    const response = await fetch('http://localhost:3000/api/airdrop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddresses,
        amounts,
        priorityLevel,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to process airdrop')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error triggering airdrop:', error)
    throw error
  }
}
const walletData = [
  {
    wallet_address: 'dummy',
  },
]

// Import wallet addresses from JSON file
const wallets = (walletData as WalletItem[]).map((item) => item.wallet_address)

const SSE_AMOUNT = '100000'
const decimals = 6
const totalAmount = Number(SSE_AMOUNT) * Math.pow(10, decimals)
const numberOfWallets = wallets.length
const amountPerWallet = Math.floor(totalAmount / numberOfWallets)

// Generate equal amounts for each wallet
const amounts = Array(wallets.length).fill(amountPerWallet.toString())

// Trigger the airdrop
async function runAirdrop() {
  try {
    console.log({
      NUMBER_OF_WALLETS: numberOfWallets,
      AMOUNT_PER_WALLET: amountPerWallet / 10 ** decimals,
    })
    const result = await triggerAirdrop(wallets, amounts, 'High')

    // You can get the transaction signatures from the response
    const { walletStatuses } = result
    console.log('Wallet statuses:', walletStatuses)
  } catch (error) {
    console.error('Airdrop failed:', error)
  }
}

runAirdrop()
