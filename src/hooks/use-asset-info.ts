// in hooks/use-asset-info.ts
import { useState, useEffect } from 'react';

export function useAssetInfo(mintAddress: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssetInfo() {
      if (!mintAddress) {
        setData(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/asset/${mintAddress}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch asset info: ${response.status}`);
        }
        
        const assetData = await response.json();
        setData(assetData);
      } catch (err) {
        console.error('Error fetching asset info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch asset info');
      } finally {
        setLoading(false);
      }
    }

    fetchAssetInfo();
  }, [mintAddress]);
  return { data, loading, error };
}