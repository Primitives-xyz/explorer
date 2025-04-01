export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 32-44 characters long
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
  return (
    base58Regex.test(address) && address.length >= 32 && address.length <= 44
  )
}
