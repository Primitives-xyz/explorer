import { type } from 'os';

const BASE_URL = process.env.NEXT_PUBLIC_TAPESTRY_URL || 'https://api.usetapestry.dev/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_TAPESTRY_API_KEY;

if (!API_KEY) {
  throw new Error('NEXT_PUBLIC_TAPESTRY_API_KEY is not defined in environment variables');
}

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
    console.log('Request URL:', `${BASE_URL}/profiles/?apiKey=${API_KEY}&walletAddress=${walletAddress}&shouldIncludeExternalProfiles=true`);
    const response = await fetch(
      `${BASE_URL}/profiles/?apiKey=${API_KEY}&walletAddress=${walletAddress}&shouldIncludeExternalProfiles=true`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      }
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
    
    const data: ProfileResponse = await response.json();
    return data.profiles;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function getFollowStats(profileId: string): Promise<FollowStats> {
  const [followersRes, followingRes] = await Promise.all([
    fetch(`${BASE_URL}/profiles/${profileId}/followers?apiKey=${API_KEY}`),
    fetch(`${BASE_URL}/profiles/${profileId}/following?apiKey=${API_KEY}`)
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
