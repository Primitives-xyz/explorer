const BASE_URL = 'https://api.usetapestry.dev/api/v1';

interface Profile {
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
    `${BASE_URL}/profiles?walletAddress=${walletAddress}&shouldIncludeExternal=true`,
    {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_TAPESTRY_API_KEY || '',
      },
    }
  );
  
  const data: ProfileResponse = await response.json();
  return data.profiles;
}

export async function getFollowStats(profileId: string): Promise<FollowStats> {
  const [followersRes, followingRes] = await Promise.all([
    fetch(`${BASE_URL}/profiles/${profileId}/followers`, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_TAPESTRY_API_KEY || '',
      },
    }),
    fetch(`${BASE_URL}/profiles/${profileId}/following`, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_TAPESTRY_API_KEY || '',
      },
    }),
  ]);

  const followers = await followersRes.json();
  const following = await followingRes.json();

  return {
    followers: followers.total,
    following: following.total,
  };
}
