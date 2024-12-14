'use client';

import { useState } from 'react';
import { getProfiles, getFollowStats, type Profile as ApiProfile, ITEMS_PER_PAGE } from '@/utils/api';
import { LoadMoreObserver } from '@/components/load-more-observer';

interface ProfileWithStats extends ApiProfile {
  followStats?: {
    followers: number;
    following: number;
  };
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const handleSearch = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    setPage(1);
    
    try {
      const profilesData = await getProfiles(walletAddress, 1);
      
      if (!profilesData.items || profilesData.items.length === 0) {
        setError('No profiles found for this wallet address');
        setProfiles([]);
        return;
      }

      const profilesWithStats = await Promise.all(
        profilesData.items.map(async (profile) => {
          try {
            const stats = await getFollowStats(profile.profile.id);
            return {
              ...profile,
              followStats: stats,
            };
          } catch (error) {
            console.error(`Error fetching stats for profile ${profile.profile.id}:`, error);
            return {
              ...profile,
              followStats: { followers: 0, following: 0 },
            };
          }
        })
      );
      
      setProfiles(profilesWithStats);
      setHasMore(profilesData.hasMore);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to fetch profiles. Please try again.');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const newData = await getProfiles(walletAddress, nextPage);
      
      const newProfilesWithStats = await Promise.all(
        newData.items.map(async (profile) => {
          try {
            const stats = await getFollowStats(profile.profile.id);
            return {
              ...profile,
              followStats: stats,
            };
          } catch (error) {
            return {
              ...profile,
              followStats: { followers: 0, following: 0 },
            };
          }
        })
      );

      setProfiles([...profiles, ...newProfilesWithStats]);
      setPage(nextPage);
      setHasMore(newData.hasMore);
    } catch (error) {
      console.error('Error loading more profiles:', error);
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
              key={profile.profile.id}
              className="p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-6 flex-grow">
                  {profile.profile.image && (
                    <img
                      src={profile.profile.image}
                      alt={profile.profile.username}
                      className="w-16 h-16 rounded-full shadow object-cover"
                    />
                  )}

                  <div className="flex-grow">
                    <h2 className="text-xl font-bold text-gray-900">
                      {profile.profile.username}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {profile.wallet.address}
                    </p>
                    {profile.profile.bio && (
                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                        {profile.profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {profile.namespace?.faviconURL && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      <img 
                        src={profile.namespace.faviconURL} 
                        alt={profile.namespace.name}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">
                        {profile.namespace.readableName}
                      </span>
                    </div>
                  )}

                  {profile.followStats && (
                    <div className="text-right mt-2">
                      <p className="text-gray-900">
                        <span className="font-bold text-lg">
                          {profile.followStats.followers}
                        </span>
                        <span className="text-gray-600 ml-1">followers</span>
                      </p>
                      <p className="text-gray-900">
                        <span className="font-bold text-lg">
                          {profile.followStats.following}
                        </span>
                        <span className="text-gray-600 ml-1">following</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <LoadMoreObserver
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            loading={loading}
          />
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
