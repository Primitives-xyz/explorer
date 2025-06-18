import type { PerpTradeContent } from '@/types/content'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { OrderType, PositionDirection } from '@drift-labs/sdk-browser'
import { getAuthToken } from '@dynamic-labs/sdk-react-core'

interface CreatePerpTradeContentNodeParams {
  signature: string
  marketSymbol: string
  marketIndex: number
  direction: PositionDirection
  size: string // Human-readable size
  orderType: OrderType
  limitPrice?: string | null // Human-readable limit price if applicable
  reduceOnly?: boolean
  slippage: string // User-defined slippage setting
  walletAddress: string
  // Optional fields, might not be available immediately on order placement
  entryPrice?: string // Estimated or actual entry price
  leverage?: number
  fees?: string
  route?: 'trenches' | 'trade' | 'home' // Where the trade was executed from
  // TODO: Add sourceWallet, sourceWalletUsername, sourceWalletImage for copied trades later
}

export function useCreatePerpTradeContent() {
  const { mainProfile } = useCurrentWallet()

  const createPerpTradeContentNode = async ({
    signature,
    marketSymbol,
    marketIndex,
    direction,
    size,
    orderType,
    limitPrice,
    reduceOnly,
    slippage,
    walletAddress,
    entryPrice, // Optional for now
    leverage, // Optional for now
    fees, // Optional for now
    route, // Optional - where the trade was executed from
  }: CreatePerpTradeContentNodeParams) => {
    try {
      // Fetch wallet profile
      const walletProfilesResponse = await fetch(
        `/api/profiles?walletAddress=${walletAddress}`
      )
      const walletProfilesData = await walletProfilesResponse.json()
      const walletProfile = walletProfilesData.profiles?.find(
        (p: any) => p.namespace.name === EXPLORER_NAMESPACE
      )?.profile

      // Create the base content properties
      const content: Omit<
        PerpTradeContent,
        | 'transactionType'
        | 'sourceWallet'
        | 'sourceWalletUsername'
        | 'sourceWalletImage'
      > = {
        type: 'perp_trade' as const,
        txSignature: signature,
        timestamp: String(Date.now()),
        marketSymbol,
        marketIndex: String(marketIndex),
        direction: direction === PositionDirection.LONG ? 'long' : 'short',
        size,
        orderType: orderType === OrderType.MARKET ? 'market' : 'limit',
        limitPrice: limitPrice ?? '',
        reduceOnly: String(reduceOnly ?? false),
        slippage,
        walletAddress: walletAddress,
        walletUsername: walletProfile?.username || '',
        walletImage: walletProfile?.image || '',
        route: route || '',
        // Include optional fields if provided
        ...(entryPrice && { entryPrice }),
        ...(leverage && { leverage: String(leverage) }),
        ...(fees && { fees }),
        // Default PNL for opening trades, adjust later for closing trades
        pnl: '0',
      }

      // Add transactionType (assuming 'direct' for now)
      // TODO: Adapt for copied trades later
      const fullContent: PerpTradeContent = {
        ...content,
        transactionType: 'direct',
        sourceWallet: '',
        sourceWalletUsername: '',
        sourceWalletImage: '',
      }

      // Convert content object to properties array
      const contentToProperties = (obj: Record<string, any>) => {
        return Object.entries(obj)
          .filter(([_, value]) => value !== undefined && value !== null) // Filter out undefined/null values
          .map(([key, value]) => ({
            key,
            value: String(value), // Ensure all values are strings
          }))
      }

      // Post the content to the API
      const authToken = getAuthToken()
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          // Assuming signature is the unique ID for the content node
          id: signature,
          profileId: mainProfile?.username || '', // Use the currently logged-in user's profile
          // TODO: Add sourceWallet if it's a copied trade
          // sourceWallet: fullContent.sourceWallet,
          marketSymbol: marketSymbol, // Add relevant top-level fields for easier querying if needed
          route: route || '',
          properties: contentToProperties(fullContent),
        }),
      })

      console.log('Perp trade content node created successfully:', signature)
    } catch (err) {
      console.error('Error creating perp trade content node:', err)
      // Decide if we should notify the user or just log
    }
  }

  return { createPerpTradeContentNode }
}
