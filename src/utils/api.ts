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
  const response = await fetch(
    `${BASE_URL}/profiles?walletAddress=${walletAddress}&shouldIncludeExternal=true&apiKey=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  const data: ProfileResponse = await response.json();
  return data.profiles;
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
