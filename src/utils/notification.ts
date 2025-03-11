import { socialfi } from '@/utils/socialfi'

interface IBaseNotification {
  recipientWalletAddress: string
}

interface ITransactionCopiedNotification extends IBaseNotification {
  notificationType: 'TRANSACTION_COPIED'
  authorUsername: string
  tokenPair: string
}

interface IEarningsNotification extends IBaseNotification {
  notificationType: 'EARNINGS_RECEIVED'
  tokenAmount: string
  usdAmount: string
}

type NotificationPayload =
  | ITransactionCopiedNotification
  | IEarningsNotification

export const sendNotification = async (payload: NotificationPayload) => {
  console.log('[SEND NOTIFICATION]', JSON.stringify(payload))

  try {
    switch (payload.notificationType) {
      case 'TRANSACTION_COPIED': {
        const response = await socialfi.api.notifications.notificationsCreate(
          {},
          {
            message: `Hey there influencer – ${payload.authorUsername} just copied your ${payload.tokenPair} trade!`,
            recipient: payload.recipientWalletAddress,
            medium: 'wallet',
            title: 'Trade Copied!',
          }
        )

        if (!response) {
          throw new Error('Failed to send notification - no response received')
        }

        return response
      }

      case 'EARNINGS_RECEIVED': {
        const response = await socialfi.api.notifications.notificationsCreate(
          {},
          {
            message: `Congrats! You've just received ${payload.tokenAmount} tokens (worth ${payload.usdAmount} USD) from your copied trades on SSE. Keep up the great work!`,
            recipient: payload.recipientWalletAddress,
            medium: 'wallet',
            title: 'Earnings Received!',
          }
        )

        if (!response) {
          throw new Error('Failed to send notification - no response received')
        }

        return response
      }
    }
  } catch (error) {
    console.error('[sendNotification Error]:', error)
    throw error
  }
}
