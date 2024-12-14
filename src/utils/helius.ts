import { Helius } from 'helius-sdk';

export enum TokenType {
  ALL = 'ALL',
  FUNGIBLE = 'FUNGIBLE',
  NFT = 'NFT',
}

export interface FungibleToken {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  balance: number;
  price?: number;
  currency?: string;
}

export async function getTokens(walletAddress: string): Promise<FungibleToken[]> {
  try {
    const helius = new Helius(process.env.NEXT_PUBLIC_HELIUS_API_KEY!);

    const assets = await helius.rpc.searchAssets({
      ownerAddress: walletAddress,
      tokenType: TokenType.FUNGIBLE,
      displayOptions: {
        showCollectionMetadata: true,
      },
    });

    if (!assets || !assets.items) {
      return [];
    }

    return assets.items.map((item: any) => ({
      id: item.id,
      name: item.content?.metadata?.name || 'Unknown Token',
      symbol: item.content?.metadata?.symbol || '',
      imageUrl: item.content?.links?.image || null,
      balance: Number(item.token_info?.balance || 0) / Math.pow(10, item.token_info?.decimals || 0),
      price: item.token_info?.price_info?.price_per_token || 0,
      currency: 'USDC',
    }));
  } catch (error: any) {
    console.error('Error fetching tokens:', error);
    throw new Error(`Failed to fetch tokens: ${error.message}`);
  }
}

// Optional: Add function to get a single asset details
export async function getAssetDetails(tokenId: string) {
  try {
    const helius = new Helius(process.env.NEXT_PUBLIC_HELIUS_API_KEY!);

    const asset = await helius.rpc.getAsset({
      id: tokenId,
      displayOptions: {
        showCollectionMetadata: true,
      },
    });

    return asset;
  } catch (error: any) {
    console.error('Error fetching asset details:', error);
    throw new Error(`Failed to fetch asset details: ${error.message}`);
  }
} 