import { useCurrentWallet } from '@/utils/use-current-wallet'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

export interface MigrationStatus {
  needsMigration: boolean
  isLoading: boolean
  error: Error | null
  oldAccountData?: {
    deposit: string
    debt: string
    lastUpdate: string
    initialized: boolean
  } | null
}

/**
 * Checks if a user account needs migration from old format (65 bytes) to new format
 */
export function useMigrationCheck(): MigrationStatus {
  const { walletAddress } = useCurrentWallet()
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    needsMigration: false,
    isLoading: true,
    error: null,
  })

  const swrKey = walletAddress ? `/migration/check/${walletAddress}` : null

  const { data, error, isLoading } = useSWR(
    swrKey,
    async () => {
      if (!walletAddress) return null

      try {
        const connection = new Connection(
          process.env.NEXT_PUBLIC_RPC_URL ||
            'https://api.mainnet-beta.solana.com'
        )

        // Program ID for SSE staking contract
        const PROGRAM_ID = new PublicKey(
          'sseobVr99LLaERn6JvFDC7E9EjYFdP4ggpM51P9XBHJ'
        )

        // Find user info PDA
        const [userInfoPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('userinfo'), new PublicKey(walletAddress).toBytes()],
          PROGRAM_ID
        )

        const accountInfo = await connection.getAccountInfo(userInfoPda)

        // No account exists - will be created fresh
        if (!accountInfo) {
          return {
            needsMigration: false,
            oldAccountData: null,
          }
        }

        // Check if it's the old size (65 bytes total including discriminator)
        if (accountInfo.data.length === 65) {
          console.log(`User ${walletAddress} needs migration`)

          // Parse old account data
          const data = accountInfo.data
          let offset = 8 // Skip discriminator

          // Read user pubkey (32 bytes) - skip it
          offset += 32

          // Read deposit (8 bytes, little-endian)
          const deposit = data.readBigUInt64LE(offset)
          offset += 8

          // Read debt (8 bytes, little-endian)
          const debt = data.readBigUInt64LE(offset)
          offset += 8

          // Read last_update (8 bytes, little-endian)
          const lastUpdate = data.readBigInt64LE(offset)
          offset += 8

          // Read initialized (1 byte)
          const initialized = data.readUInt8(offset) === 1

          return {
            needsMigration: true,
            oldAccountData: {
              deposit: deposit.toString(),
              debt: debt.toString(),
              lastUpdate: lastUpdate.toString(),
              initialized,
            },
          }
        }

        return {
          needsMigration: false,
          oldAccountData: null,
        }
      } catch (error) {
        console.error('Error checking migration status:', error)
        throw error
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  useEffect(() => {
    if (data !== undefined) {
      setMigrationStatus({
        needsMigration: data?.needsMigration || false,
        oldAccountData: data?.oldAccountData,
        isLoading: false,
        error: null,
      })
    }
  }, [data])

  useEffect(() => {
    if (error) {
      setMigrationStatus((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }))
    }
  }, [error])

  return {
    ...migrationStatus,
    isLoading,
  }
}
