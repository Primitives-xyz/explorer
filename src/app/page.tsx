'use client';

import { useState, ChangeEvent } from 'react';
import { getProfiles, getFollowStats, type Profile as ApiProfile } from '@/utils/api';

interface Profile extends ApiProfile {
  followStats?: {
    followers: number;
    following: number;
  };
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const profilesData = await getProfiles(walletAddress);
      
      // Get follow stats for each profile
      const profilesWithStats = await Promise.all(
        profilesData.map(async (profile) => {
          const stats = await getFollowStats(profile.id);
          return {
            ...profile,
            followStats: stats,
          };
        })
      );
      
      setProfiles(profilesWithStats);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Social Graph Explorer</h1>
        
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={walletAddress}
            onChange={handleInputChange}
            placeholder="Enter Solana wallet address"
            className="flex-1 p-2 border rounded text-black bg-white"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="p-4 border rounded shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                {profile.avatar && (
                  <img
                    src={profile.avatar}
                    alt={profile.handle}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <h2 className="font-bold">{profile.displayName}</h2>
                  <p className="text-gray-600">@{profile.handle}</p>
                </div>
                {profile.followStats && (
                  <div className="ml-auto text-sm">
                    <p><span className="font-bold">{profile.followStats.followers}</span> followers</p>
                    <p><span className="font-bold">{profile.followStats.following}</span> following</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
