// hooks/use-transaction-details.ts
import { useState, useEffect } from 'react';
import type { Transaction } from '@/utils/helius/types';

export function useTransactionDetails(signature: string | null) {
  const [data, setData] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactionDetails() {
      if (!signature) {
        setData(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/transactions/${signature}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch transaction: ${response.status}`);
        }
        
        const transactionData = await response.json();
        setData(transactionData);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactionDetails();
  }, [signature]);

  return { data, loading, error };
}