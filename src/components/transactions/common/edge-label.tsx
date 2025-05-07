'use client'

import { FC } from 'react'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { SOL_MINT } from '@/utils/constants'

// Edge label component to display token transfer information
export const EdgeLabel: FC<{ mint: string, amount: number, color?: string }> = ({ mint, amount, color }) => {
  const isSol = mint === SOL_MINT;
  const { symbol } = useTokenInfo(isSol ? null : mint);
  let displaySymbol = symbol || (isSol ? 'SOL' : undefined);
  
  return (
    <div className="edge-label-content" style={{
      background: 'rgba(0, 0, 0, 0.8)',
      color: color || 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 500,
      textAlign: 'center',
      width: 'fit-content',
      margin: '0 auto',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }}>
      <strong className="mr-1">{amount}</strong>{displaySymbol || mint.slice(0, 4)}
    </div>
  );
}; 