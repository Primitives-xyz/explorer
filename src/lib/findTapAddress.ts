import { Keypair } from '@solana/web3.js'

export interface TapAddressResult {
  publicKey: string;
  secretKey: string;
  attempts: number;
}

/**
 * Finds a Solana keypair with an address ending in 'tap'
 * @param maxAttempts Maximum number of attempts to try
 * @returns The keypair information if found, or null if not found within maxAttempts
 */
export async function findTapAddress(maxAttempts = 100000): Promise<TapAddressResult | null> {
  let attempts = 0
  let foundKeypair = null

  // Generate keypairs until we find one with 'tap' at the end
  while (!foundKeypair && attempts < maxAttempts) {
    const keypair = Keypair.generate()
    const address = keypair.publicKey.toString().toLowerCase()
    
    if (address.endsWith('tap')) {
      foundKeypair = keypair
      break
    }
    
    attempts++
    
    // Log progress every 1000 attempts
    if (attempts % 1000 === 0) {
      console.log(`[Find TAP] Generated ${attempts} keypairs so far...`)
    }
    
    // Yield control back to the event loop periodically to prevent blocking
    if (attempts % 5000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  // If we couldn't find a matching keypair, return null
  if (!foundKeypair) {
    return null
  }

  // Return the keypair's public key and secret key
  return {
    publicKey: foundKeypair.publicKey.toString(),
    secretKey: Buffer.from(foundKeypair.secretKey).toString('hex'),
    attempts
  }
}

/**
 * In the future, this could be replaced with:
 * 1. A pregenerated list of TAP addresses
 * 2. A more optimized algorithm
 * 3. A server-side worker pool that maintains TAP addresses
 * 4. Integration with a vanity address generation service
 * Without changing the API interface
 */ 