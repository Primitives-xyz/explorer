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
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    try {
      const profilesData = await getProfiles(walletAddress);
      console.log('Received profiles:', profilesData); // Debug log
      
      if (!profilesData || profilesData.length === 0) {
        setError('No profiles found for this wallet address');
        setProfiles([]);
        return;
      }

      // Get follow stats for each profile
      const profilesWithStats = await Promise.all(
        profilesData.map(async (profile) => {
          try {
            const stats = await getFollowStats(profile.id);
            return {
              ...profile,
              followStats: stats,
            };
          } catch (error) {
            console.error(`Error fetching stats for profile ${profile.id}:`, error);
            return {
              ...profile,
              followStats: { followers: 0, following: 0 },
            };
          }
        })
      );
      
      console.log('Profiles with stats:', profilesWithStats); // Debug log
      setProfiles(profilesWithStats);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to fetch profiles. Please try again.');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Social Graph Explorer</h1>
        
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={walletAddress}
            onChange={handleInputChange}
            placeholder="Enter Solana wallet address"
            className="flex-1 p-2 border rounded text-black bg-white shadow-sm"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-6">
                {profile.avatar && (
                  <img
                    src={profile.avatar}
                    alt={profile.handle}
                    className="w-16 h-16 rounded-full shadow"
                  />
                )}
                <div className="flex-grow">
                  <h2 className="text-xl font-bold text-gray-900">{profile.displayName}</h2>
                  <p className="text-gray-600">@{profile.handle}</p>
                  {profile.bio && (
                    <p className="mt-2 text-gray-700">{profile.bio}</p>
                  )}
                </div>
                {profile.followStats && (
                  <div className="text-right">
                    <p className="text-gray-900">
                      <span className="font-bold text-lg">{profile.followStats.followers}</span>
                      <span className="text-gray-600 ml-1">followers</span>
                    </p>
                    <p className="text-gray-900">
                      <span className="font-bold text-lg">{profile.followStats.following}</span>
                      <span className="text-gray-600 ml-1">following</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {!loading && profiles.length === 0 && !error && (
          <div className="text-center py-8 text-gray-600">
            Enter a wallet address to see associated profiles
          </div>
        )}
      </div>
    </main>
  );
}
