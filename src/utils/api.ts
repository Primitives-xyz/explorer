import { type } from 'os';
import { PaginatedData } from '@/types/pagination';

export interface Profile {
  profile: {
    id: string;
    namespace: string;
    username: string;
    bio: string | null;
    image: string | null;
    blockchain: string;
    created_at: number;
  };
  wallet: {
    address: string;
  };
  namespace: {
    id: number;
    name: string;
    readableName: string;
    faviconURL: string;
    createdAt: string;
    updatedAt: string;
    isDefault: boolean;
    team_id: number;
  };
}

interface ProfileResponse {
  profiles: Profile[];
  page: number;
  pageSize: number;
}

interface FollowStats {
  followers: number;
  following: number;
}

export const ITEMS_PER_PAGE = 10;

export async function getProfiles(
  walletAddress: string,
  page: number = 1
): Promise<PaginatedData<Profile>> {
  try {
    const response = await fetch(
      `/api/profiles?walletAddress=${walletAddress}&page=${page}&limit=${ITEMS_PER_PAGE}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      items: data.profiles || [],
      hasMore: data.profiles.length === ITEMS_PER_PAGE,
      page: data.page,
      pageSize: data.pageSize
    };
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function getFollowStats(username: string): Promise<FollowStats> {
  const [followersRes, followingRes] = await Promise.all([
    fetch(`/api/profiles/${username}/followers`),
    fetch(`/api/profiles/${username}/following`)
  ]);

  if (!followersRes.ok || !followingRes.ok) {
    throw new Error('Failed to fetch follow stats');
  }

  const followers = await followersRes.json();
  const following = await followingRes.json();

  return {
    followers: followers.total,
    following: following.total,
  };
}
