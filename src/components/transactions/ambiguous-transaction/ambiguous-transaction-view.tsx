import { Button, ButtonVariant, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from '@/components/ui'
import { TransferLine } from '@/components/transactions/common/transfer-line'
import { TransactionsHeader } from '@/components/transactions/transactions-header'
import TokenTransferGraph from '@/components/transactions/common/token-transfer-graph'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import Image from 'next/image'
import { Transaction } from '@/components/tapestry/models/helius.models'
import React from 'react'

interface AmbiguousTransactionViewProps {
  transaction: Transaction; // Replace with proper transaction type
}

// Enhanced NFT preview component
const NFTPreview = ({ mint, price, owner, tokenStandard }: { mint: string, price?: number, owner?: string, tokenStandard?: string }) => {
  const tokenInfo = useTokenInfo(mint)
  const { image, name, loading } = tokenInfo
  const [expanded, setExpanded] = React.useState(false)

  // Format price to be more user-friendly
  const formattedPrice = React.useMemo(() => {
    if (typeof price !== 'number') return null;
    const solPrice = price / 1e9;
    if (solPrice >= 1000) {
      return `${(solPrice / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}k SOL`;
    }
    return `${solPrice.toLocaleString(undefined, { maximumFractionDigits: 3 })} SOL`;
  }, [price]);

  // Sort creators by share percentage (descending)
  const creators = React.useMemo(() => {
    const creatorsList = tokenInfo?.data?.result?.creators || [];
    return [...creatorsList].sort((a, b) => (b.share ?? 0) - (a.share ?? 0));
  }, [tokenInfo?.data?.result?.creators]);

  // Get collection info from grouping
  const collection = React.useMemo(() => {
    return tokenInfo?.data?.result?.grouping?.find(
      (g) => g.group_key === "collection"
    )?.group_value;
  }, [tokenInfo?.data?.result?.grouping]);

  // Get authorities and their scopes
  const authorities = tokenInfo?.data?.result?.authorities || [];
  
  // Get attributes (if they exist)
  const attributes = tokenInfo?.data?.result?.content?.metadata?.attributes || [];
  
  // Get royalty info
  const royalty = tokenInfo?.data?.result?.royalty;
  
  // Get description
  const description = tokenInfo?.data?.result?.content?.metadata?.description;

  // Filter attributes to show (excluding Attributes Count)
  const displayAttributes = attributes.filter(attr => attr.trait_type !== "Attributes Count");

  // Get ownership model and frozen status
  const ownership = tokenInfo?.data?.result?.ownership;

  return (
    <Card className="w-full h-full max-w-none overflow-visible border-muted">
      <CardHeader className="pb-0 flex flex-row items-start justify-between">
        <div className="flex flex-col">
          <CardTitle className="text-sm font-semibold truncate">{name || 'Loading...'}</CardTitle>
          {formattedPrice && (
            <Badge variant="outline" className="mt-1 w-fit bg-green-100 text-green-700 border-green-300">
              {formattedPrice}
            </Badge>
          )}
        </div>
        <Button
          variant={ButtonVariant.OUTLINE}
          size="sm"
          className="ml-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Less details' : 'More details'}
        </Button>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Left column: NFT Image, Mint, Token Standard */}
          <div className="md:w-1/3 space-y-2 flex flex-col items-center">
            {/* NFT Image */}
            <div className="relative w-full aspect-square bg-muted rounded overflow-hidden flex-shrink-0 max-w-[180px]">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : image ? (
                <Image src={image} alt={name || mint} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            {/* Mint Address */}
            <div className="w-full">
              <div className="text-xs text-muted-foreground mb-0.5">Mint</div>
              <SolanaAddressDisplay
                address={mint}
                displayAbbreviatedAddress
                highlightable
                showCopyButton
                className="text-xs"
              />
            </div>
            {/* Token Standard & Ownership Model */}
            <div className="w-full flex flex-wrap gap-1">
              {/* {tokenStandard && (
                <Badge variant="outline" className="text-xs">
                  {tokenStandard}
                </Badge>
              )} */}
              {ownership?.ownership_model && (
                <Badge variant="outline" className="text-xs">
                  {ownership.ownership_model}
                </Badge>
              )}
              {ownership?.frozen && (
                <Badge variant="secondary" className="text-xs">
                  Frozen
                </Badge>
              )}
            </div>
          </div>
          {/* Right column: Collection, Attributes, etc */}
          <div className="md:w-2/3 w-full space-y-3">
            {/* Collection */}
            {collection && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Collection</div>
                <SolanaAddressDisplay
                  address={collection}
                  displayAbbreviatedAddress
                  highlightable
                  showCopyButton
                  className="text-xs"
                />
              </div>
            )}
            {/* Owner */}
            {owner && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Owner</div>
                <SolanaAddressDisplay
                  address={owner}
                  displayAbbreviatedAddress
                  highlightable
                  showCopyButton
                  className="text-xs"
                />
              </div>
            )}
            {/* Attributes (if they exist) */}
            {displayAttributes.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Attributes</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {displayAttributes.map((attr, i) => (
                    <div key={i} className="bg-muted/30 p-2 rounded text-center min-w-0">
                      <div className="text-xs text-muted-foreground truncate">{attr.trait_type}</div>
                      <div className="text-xs font-medium truncate" title={attr.value?.toString()}>
                        {attr.value?.toString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 w-full space-y-3">
            {/* Authorities */}
            {authorities.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Authorities</div>
                <div className="space-y-1">
                  {authorities.map((auth, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                      <SolanaAddressDisplay
                        address={auth.address}
                        displayAbbreviatedAddress
                        highlightable
                        showCopyButton
                        className="text-xs"
                      />
                      <div className="flex gap-1">
                        {auth.scopes.map((scope, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Description */}
            {description && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Description</div>
                <div className="text-xs bg-muted/30 p-2 rounded text-foreground/80">
                  {description}
                </div>
              </div>
            )}
            {/* Creators */}
            {creators.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Creators</div>
                <div className="space-y-2">
                  {creators.map((creator, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                      <SolanaAddressDisplay
                        address={creator.address}
                        displayAbbreviatedAddress
                        highlightable
                        showCopyButton
                        className="text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <Badge variant={creator.verified ? "default" : "outline"} className="text-xs">
                          {creator.share}%
                        </Badge>
                        {creator.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Royalty info */}
            {royalty && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Royalty</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {royalty.percent || royalty.basis_points / 100}% Royalty
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {royalty.royalty_model} model
                  </Badge>
                  {royalty.locked && (
                    <Badge className="text-xs">
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {/* Links */}
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-2">Links</div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={ButtonVariant.OUTLINE}
                  href={`https://explorer.solana.com/address/${mint}`}
                  newTab
                  className="text-xs py-1 h-auto"
                >
                  Explorer
                </Button>
                <Button
                  variant={ButtonVariant.OUTLINE}
                  href={`https://magiceden.io/item-details/${mint}`}
                  newTab
                  className="text-xs py-1 h-auto"
                >
                  Magic Eden
                </Button>
                {tokenInfo?.data?.result?.content?.links?.external_url && (
                  <Button
                    variant={ButtonVariant.OUTLINE}
                    href={tokenInfo.data.result.content.links.external_url}
                    newTab
                    className="text-xs py-1 h-auto"
                  >
                    Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const AmbiguousTransactionView = ({ transaction }: AmbiguousTransactionViewProps) => {
  console.log(transaction)
  const nftEvent = transaction?.events?.nft

  if (nftEvent) {
    const {
      type: eventType,
      source,
      description,
      amount,
      fee,
      feePayer = 'transaction.feePayer',
      seller,
      buyer,
      staker,
      nfts = [],
      signature,
      timestamp,
    } = nftEvent

    // Owner: try to get from tokenInfo, fallback to seller or buyer
    // We'll pass this as a prop to NFTPreview

    return (
      <div className="space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <TransactionsHeader transaction={transaction} sourceWallet={feePayer} />
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-base font-semibold px-2 py-1">
                  {eventType}
                </Badge>
                {source && <span className="text-xs text-muted-foreground">on <span className="font-semibold">{source}</span></span>}
              </div>
              {description && <div className="text-sm text-muted-foreground">{description}</div>}
            </div>
          </CardHeader>
        </Card>

        {/* NFT(s) Involved */}
        <Card className="w-full h-full max-w-none overflow-visible border-muted">
          <CardHeader className="pb-0" />
          <CardContent className="pt-2">
              {/* Left column: NFT Image, Mint, Token Standard, Price, Owner */}
              <div className="md:w-3/3 space-y-3">
                {/* NFT Image */}
                <NFTPreview
                  mint={nfts[0]?.mint ?? ''}
                  price={amount}
                  owner={transaction?.accountData?.find(a => a.nativeBalanceChange > 0)?.account || seller || buyer || ''}
                  tokenStandard={nfts[0]?.tokenStandard}
                />
              </div>
          </CardContent>
        </Card>
        {/* Token Transfer Graph */}
        <TokenTransferGraph transaction={transaction} />
        {/* Token Transfers Section */}
        {transaction.tokenTransfers && transaction.tokenTransfers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Token Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transaction.tokenTransfers.map((tt: any, i: number) => (
                  <TransferLine
                    key={i}
                    from={tt.fromUserAccount}
                    to={tt.toUserAccount}
                    mint={tt.mint || tt.tokenMint}
                    amount={tt.tokenAmount}
                    timestamp={transaction.timestamp}
                    direction={tt.fromUserAccount === transaction.feePayer ? 'out' : tt.toUserAccount === transaction.feePayer ? 'in' : undefined}
                    className="bg-[#97EF830D] rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Fallback: generic view
  return (
    <div className="space-y-4">
      <Card>
        {/* Header */}
        <TransactionsHeader transaction={transaction} sourceWallet={transaction.feePayer} />
      </Card>
      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Unknown Transaction Type</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div>Type: {transaction?.type || 'Unknown'}</div>
          <div className="text-sm text-muted-foreground">
            This type of transaction is not yet supported.
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant={ButtonVariant.DEFAULT}
              href={transaction?.signature ? `https://solscan.io/tx/${transaction.signature}` : undefined}
              newTab
            >
              View on Solscan
            </Button>
            <Button
              variant={ButtonVariant.SECONDARY}
              href={transaction?.signature ? `https://solana.fm/tx/${transaction.signature}` : undefined}
              newTab
            >
              View on Solana.fm
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Token Transfer Graph */}
      <TokenTransferGraph transaction={transaction} />
      {/* Token Transfers Section */}
      {transaction.tokenTransfers && transaction.tokenTransfers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Token Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transaction.tokenTransfers.map((tt: any, i: number) => (
                <TransferLine
                  key={i}
                  from={tt.fromUserAccount}
                  to={tt.toUserAccount}
                  mint={tt.mint || tt.tokenMint}
                  amount={tt.tokenAmount}
                  timestamp={transaction.timestamp}
                  direction={tt.fromUserAccount === transaction.feePayer ? 'out' : tt.toUserAccount === transaction.feePayer ? 'in' : undefined}
                  className="bg-[#97EF830D] rounded"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 