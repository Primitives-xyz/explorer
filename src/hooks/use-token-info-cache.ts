import { useState, useEffect, useRef } from 'react';
import { useAssetInfo } from '@/hooks/use-asset-info';

// Constants
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Global cache that persists between component renders and even between different instances
const globalTokenCache: Record<string, any> = {};

/**
 * Custom hook to cache token info across renders and components
 * Uses a global cache to persist data between component instances
 */
export function useTokenInfo(mintAddress: string | null) {
  // Skip SOL mint as it doesn't need to be fetched
  const effectiveMint = (!mintAddress || mintAddress === SOL_MINT) ? null : mintAddress;
  
  // Track if we've already fetched this token in this component instance
  const fetchedRef = useRef(false);
  
  // States to track data and loading
  const [data, setData] = useState(() => effectiveMint ? globalTokenCache[effectiveMint] : null);
  const [loading, setLoading] = useState(!data && !!effectiveMint);
  
  useEffect(() => {
    // Reset state when mint address changes
    if (effectiveMint !== null && !fetchedRef.current) {
      // Check if it's already in the global cache
      if (globalTokenCache[effectiveMint]) {
        setData(globalTokenCache[effectiveMint]);
        setLoading(false);
        fetchedRef.current = true;
        return;
      }
      
      // Otherwise fetch it
      setLoading(true);
      
      // Use the Solana asset API fetch directly to avoid hook-in-hook issues
      const fetchAssetInfo = async () => {
        try {
          // Replace this with your actual fetch implementation
          // This is a placeholder for the actual asset fetch logic
          const response = await fetch(`/api/asset/${effectiveMint}`);
          const tokenInfo = await response.json();
          
          // Update global cache and state
          globalTokenCache[effectiveMint] = tokenInfo;
          setData(tokenInfo);
        } catch (error) {
          console.error(`Error fetching token info for ${effectiveMint}:`, error);
        } finally {
          setLoading(false);
          fetchedRef.current = true;
        }
      };
      
      fetchAssetInfo();
    }
  }, [effectiveMint]);
  
  return { data, loading };
}