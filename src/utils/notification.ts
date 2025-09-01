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

interface IContentLikedNotification extends IBaseNotification {
  notificationType: 'CONTENT_LIKED'
  authorUsername: string
  contentId: string
}

interface ICommentPostedNotification extends IBaseNotification {
  notificationType: 'COMMENT_POSTED'
  authorUsername: string
  contentId: string
  text: string
}

type NotificationPayload =
  | ITransactionCopiedNotification
  | IEarningsNotification
  | IContentLikedNotification
  | ICommentPostedNotification

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

      case 'CONTENT_LIKED': {
        const response = await socialfi.api.notifications.notificationsCreate(
          {},
          {
            message: `${payload.authorUsername} liked your transaction`,
            recipient: payload.recipientWalletAddress,
            medium: 'wallet',
            title: 'New like on your transaction',
          }
        )

        if (!response) {
          throw new Error('Failed to send notification - no response received')
        }

        return response
      }

      case 'COMMENT_POSTED': {
        const preview = payload.text?.slice(0, 80)
        const response = await socialfi.api.notifications.notificationsCreate(
          {},
          {
            message: `${payload.authorUsername} commented: "${preview}"`,
            recipient: payload.recipientWalletAddress,
            medium: 'wallet',
            title: 'New comment on your transaction',
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
