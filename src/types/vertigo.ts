import { Keypair, PublicKey } from "@solana/web3.js";
export interface PoolParams {
  shift: number; // Virtual SOL amount
  initialTokenReserves: number; // Initial token supply
  decimals: number; // Token decimals
  feeParams: {
    normalizationPeriod: number;
    decay: number;
    royaltiesBps: number;
    feeExemptBuys: number;
  };
}

export interface LaunchPoolParams {
  tokenName: string;
  tokenSymbol: string;
  tokenImage?: string;
  poolParams: PoolParams;
  ownerAddress: string;
  existingToken: {
    mintB: PublicKey;
    tokenWallet: PublicKey;
    walletAuthority: Keypair;
  };
  privilegedBuyer?: {
    publicKey: PublicKey;
    amount: number;
    limit: number;
  };
}

export interface BuyTokensParams {
  poolOwner: string;
  mintA: string;
  mintB: string;
  userAddress: string;
  amount: number;
  slippageBps?: number;
}

export interface SellTokensParams {
  poolOwner: string;
  mintA: string;
  mintB: string;
  userAddress: string;
  userTaA: string;
  userTaB: string;
  amount: number;
  slippageBps?: number;
}

export interface ClaimRoyaltiesParams {
  poolAddress: string;
  mintA: string;
  receiverTaA: string;
  ownerAddress: string;
}

export interface LaunchTokenParams {
  tokenMintAddress: string;
  tokenSymbol: string;
  tokenName: string;
  decimals: number;
  transferFeeBasisPoints: number;
  maximumFee: string;
  metadataUri?: string;
  targetMarketCap?: string;
  creatorWalletAddress: string;
  creatorUsername?: string;
  creatorTelegramUserId?: string;
  requiredHoldings?: string;
  // Privileged buyer fields
  privilegedBuyerAddress?: string;
  privilegedBuyerAmount?: string;
  privilegedBuyerLimit?: string;
}
