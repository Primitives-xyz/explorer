import type {
  ICreateCommentInput,
  ICreateCommentResponse,
} from '@/models/comment.models'
import {
  type IGetSocialResponse,
  type ISuggestedProfiles,
} from '@/models/profile.models'
import { FetchMethod, fetchTapestry } from '@/utils/api'

export const createProfile = async ({
  username,
  ownerWalletAddress,
}: {
  username: string
  ownerWalletAddress: string
}): Promise<any> => {
  try {
    // Input validation
    if (!username && !ownerWalletAddress) {
      throw new Error('Both username and wallet address are required')
    }

    if (!username) {
      throw new Error('Username is required')
    }

    if (!ownerWalletAddress) {
      throw new Error('Wallet address is required')
    }

    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long')
    }

    if (username.length > 30) {
      throw new Error('Username must not exceed 30 characters')
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error(
        'Username can only contain letters, numbers, and underscores'
      )
    }

    const createProfileResponse = await fetchTapestry({
      endpoint: 'profiles/findOrCreate',
      method: FetchMethod.POST,
      data: {
        walletAddress: ownerWalletAddress,
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=${username}`,
        username,
        blockchain: 'SOLANA',
        execution: 'FAST_UNCONFIRMED',
      },
    })

    if (!createProfileResponse) {
      throw new Error(
        'Failed to create profile - no response received from server'
      )
    }

    return createProfileResponse
  } catch (error: any) {
    console.error('[createProfile Error]:', error)

    // Rethrow with more specific error messages
    if (error.message?.includes('already exists')) {
      throw new Error('This username is already taken')
    }

    if (error.message?.includes('Invalid wallet address')) {
      throw new Error('The provided wallet address is invalid')
    }

    // If it's already a custom error message from our validation, throw it as is
    if (
      error.message &&
      (error.message.includes('Username') ||
        error.message.includes('Wallet address') ||
        error.message.includes('Both username'))
    ) {
      throw error
    }

    // Generic error
    throw new Error(
      `Failed to create profile: ${
        error.message || 'An unexpected error occurred'
      }`
    )
  }
}

export const getSuggestedProfiles = async ({
  ownerWalletAddress,
}: {
  ownerWalletAddress: string
}): Promise<ISuggestedProfiles[]> => {
  try {
    if (!ownerWalletAddress) {
      throw new Error('Owner wallet address is required')
    }

    const response = await fetchTapestry<ISuggestedProfiles[]>({
      endpoint: `profiles/suggested/${ownerWalletAddress}`,
    })

    if (!response) {
      throw new Error('Failed to get suggested profiles - no response received')
    }

    return response
  } catch (error) {
    console.error('[getSuggestedProfiles Error]:', error)
    throw error
  }
}

export const getProfilesList = async (): Promise<IGetSocialResponse> => {
  try {
    const response = await fetchTapestry<IGetSocialResponse>({
      endpoint: `profiles`,
    })

    if (!response) {
      throw new Error('Failed to get profiles list - no response received')
    }

    return response
  } catch (error) {
    console.error('[getProfilesList Error]:', error)
    throw error
  }
}

export const getFollowers = async ({
  username,
}: {
  username: string
}): Promise<IGetSocialResponse> => {
  try {
    if (!username) {
      throw new Error('Username is required')
    }

    const response = await fetchTapestry<IGetSocialResponse>({
      endpoint: `profiles/${username}/followers`,
    })

    if (!response) {
      throw new Error('Failed to get followers - no response received')
    }

    return response
  } catch (error) {
    console.error('[getFollowers Error]:', error)
    throw error
  }
}

export const createComment = async ({
  profileId,
  contentId,
  text,
  commentId,
}: ICreateCommentInput): Promise<ICreateCommentResponse> => {
  try {
    if (!profileId || !contentId || !text) {
      throw new Error('Missing required fields for creating comment')
    }

    const createCommentResponse = await fetchTapestry<ICreateCommentResponse>({
      endpoint: 'comments',
      method: FetchMethod.POST,
      data: {
        contentId,
        profileId,
        text,
        ...(commentId && { commentId }),
      },
    })

    if (!createCommentResponse) {
      throw new Error('Failed to create comment - no response received')
    }

    return createCommentResponse
  } catch (error) {
    console.error('[createComment Error]:', error)
    throw error // Re-throw to handle in the component layer
  }
}

export const sendNotification = async ({
  notificationType,
  recipientWalletAddress,
  authorUsername,
  tokenPair,
}: {
  notificationType: 'TRANSACTION_COPIED'
  recipientWalletAddress: string
  authorUsername: string
  tokenPair: string
}) => {
  try {
    if (notificationType === 'TRANSACTION_COPIED') {
      const response = await fetchTapestry({
        endpoint: 'notifications',
        method: FetchMethod.POST,
        data: {
          message: `Hey there influencer – ${authorUsername} just copied your ${tokenPair} trade!`,
          recipient: recipientWalletAddress,
          medium: 'wallet',
          title: 'Trade Copied!',
        },
      })

      if (!response) {
        throw new Error('Failed to send notification - no response received')
      }

      return response
    }
  } catch (error) {
    console.error('[sendNotification Error]:', error)
    throw error
  }
}
