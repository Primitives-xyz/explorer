import { type } from 'os';

export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  // Add other profile fields as needed
}

interface ProfileResponse {
  profiles: Profile[];
}

interface FollowStats {
  followers: number;
  following: number;
}

export async function getProfiles(walletAddress: string): Promise<Profile[]> {
  try {
    const response = await fetch(`/api/profiles?walletAddress=${walletAddress}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: ProfileResponse = await response.json();
    return data.profiles;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function getFollowStats(profileId: string): Promise<FollowStats> {
  const [followersRes, followingRes] = await Promise.all([
    fetch(`/api/profiles/${profileId}/followers`),
    fetch(`/api/profiles/${profileId}/following`)
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
