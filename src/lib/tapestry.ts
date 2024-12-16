import {
  ICreateCommentInput,
  ICreateCommentResponse,
} from '@/models/comment.models'
import {
  IGetSocialResponse,
  IProfileResponse,
  ISuggestedProfiles,
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
    if (!username || !ownerWalletAddress) {
      throw new Error('Missing required fields for creating profile')
    }

    const createProfileResponse = await fetchTapestry({
      endpoint: 'profiles/findOrCreate',
      method: FetchMethod.POST,
      data: {
        walletAddress: ownerWalletAddress,
        username,
        blockchain: 'SOLANA',
      },
    })

    if (!createProfileResponse) {
      throw new Error('Failed to create profile - no response received')
    }

    return createProfileResponse
  } catch (error) {
    console.error('[createProfile Error]:', error)
    throw error
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

export const getProfileInfo = async ({
  username,
}: {
  username: string
}): Promise<IProfileResponse | null> => {
  try {
    if (!username) {
      throw new Error('Username is required')
    }

    return await fetchTapestry<IProfileResponse>({
      endpoint: `profiles/${username}`,
    })
  } catch (error) {
    console.error('[getProfileInfo Error]', error)
    return null
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

export const getFollowing = async ({
  username,
}: {
  username: string
}): Promise<IGetSocialResponse> => {
  try {
    if (!username) {
      throw new Error('Username is required')
    }

    const response = await fetchTapestry<IGetSocialResponse>({
      endpoint: `profiles/${username}/following`,
    })

    if (!response) {
      throw new Error('Failed to get following - no response received')
    }

    return response
  } catch (error) {
    console.error('[getFollowing Error]:', error)
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
