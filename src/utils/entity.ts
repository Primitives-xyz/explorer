import { fetchTokenInfo } from '@/utils/helius/das-api'
import { isNFTToken } from '@/utils/metadata'
import { getAccountOwner } from '@/utils/token'
import {
  isValidPublicKey,
  isValidTransactionSignature,
} from '@/utils/validation'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, SystemProgram } from '@solana/web3.js'

export enum ERouteType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  PROFILE = 'profile',
  WALLET = 'wallet',
  NFT = 'nft',
}

export async function determineRouteType(
  id: string,
  connection: Connection
): Promise<ERouteType> {
  const cleanId = id.startsWith('@') ? id.slice(1) : id

  if (isValidTransactionSignature(cleanId)) {
    return ERouteType.TRANSACTION
  }

  if (isValidPublicKey(cleanId)) {
    // Check the owner of the account
    const owner = await getAccountOwner(cleanId, connection)
    if (owner === SystemProgram.programId.toString()) {
      return ERouteType.WALLET // Wallet
    }
    // Only fetch token info if not a wallet
    const tokenInfo = await fetchTokenInfo(cleanId)
    if (tokenInfo && tokenInfo.result && isNFTToken(tokenInfo.result)) {
      return ERouteType.NFT
    } else if (!tokenInfo || !tokenInfo.result) {
      return ERouteType.WALLET
    } else if (
      owner === TOKEN_PROGRAM_ID.toString() ||
      owner === TOKEN_2022_PROGRAM_ID.toString()
    ) {
      return ERouteType.TOKEN // Token account or mint
    }
    return ERouteType.WALLET // Token account most likely
  }

  return ERouteType.PROFILE
}
