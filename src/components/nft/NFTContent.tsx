"use client"

import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Spinner } from '@/components/ui'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { ButtonVariant } from '@/components/ui/button/button.models'

interface NFTContentProps {
  id: string // mint address
}

export function NFTContent({ id }: NFTContentProps) {
  const { data, loading, error, name, image } = useTokenInfo(id)
  const [expanded, setExpanded] = useState(false)

  // Defensive: fallback to empty object if no data
  const nft = data?.result as any || {}
  const attributes = nft?.content?.metadata?.attributes || []
  const displayAttributes = attributes.filter((attr: any) => attr.trait_type !== 'Attributes Count')
  const collection = useMemo(() => nft?.grouping?.find((g: any) => g.group_key === 'collection')?.group_value, [nft?.grouping])
  const owner = nft?.ownership?.owner
  const authorities = nft?.authorities || []
  const creators = useMemo(() => (nft?.creators || []).sort((a: any, b: any) => (b.share ?? 0) - (a.share ?? 0)), [nft?.creators])
  const royalty = nft?.royalty
  const description = nft?.content?.metadata?.description
  const ownership = nft?.ownership

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>
  }
  if (error) {
    return <div className="text-destructive text-sm">{error}</div>
  }
  if (!nft?.id) {
    return <div className="text-muted-foreground text-sm">NFT not found</div>
  }

  return (
    <Card className="w-full h-full max-w-none overflow-visible border-muted">
      <CardHeader className="pb-0 flex flex-row items-start justify-between">
        <div className="flex flex-col">
          <CardTitle className="text-sm font-semibold truncate">{name || nft?.content?.metadata?.name || 'NFT'}</CardTitle>
        </div>
        <Button
          variant={ButtonVariant.OUTLINE}
          size="sm"
          className="ml-2"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Less details' : 'More details'}
        </Button>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Left column: NFT Image, Mint, Token Standard */}
          <div className="md:w-1/3 space-y-2 flex flex-col items-center">
            <div className="relative w-full aspect-square bg-muted rounded overflow-hidden flex-shrink-0 max-w-[180px]">
              {image ? (
                <Image src={image} alt={name || id} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No Image</div>
              )}
            </div>
            <div className="w-full">
              <div className="text-xs text-muted-foreground mb-0.5">Mint</div>
              <SolanaAddressDisplay address={id} displayAbbreviatedAddress highlightable showCopyButton className="text-xs" />
            </div>
            <div className="w-full flex flex-wrap gap-1">
              {ownership?.ownership_model && (
                <Badge variant="outline" className="text-xs">{ownership.ownership_model}</Badge>
              )}
              {ownership?.frozen && (
                <Badge variant="secondary" className="text-xs">Frozen</Badge>
              )}
            </div>
          </div>
          {/* Right column: Collection, Owner, Attributes */}
          <div className="md:w-2/3 w-full space-y-3">
            {collection && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Collection</div>
                <SolanaAddressDisplay address={collection} displayAbbreviatedAddress highlightable showCopyButton className="text-xs" />
              </div>
            )}
            {owner && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Owner</div>
                <SolanaAddressDisplay address={owner} displayAbbreviatedAddress highlightable showCopyButton className="text-xs" />
              </div>
            )}
            {displayAttributes.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Attributes</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {displayAttributes.map((attr: any, i: number) => (
                    <div key={i} className="bg-muted/30 p-2 rounded text-center min-w-0">
                      <div className="text-xs text-muted-foreground truncate">{attr.trait_type}</div>
                      <div className="text-xs font-medium truncate" title={attr.value?.toString()}>{attr.value?.toString()}</div>
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
            {authorities.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Authorities</div>
                <div className="space-y-1">
                  {authorities.map((auth: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                      <SolanaAddressDisplay address={auth.address} displayAbbreviatedAddress highlightable showCopyButton className="text-xs" />
                      <div className="flex gap-1">
                        {auth.scopes.map((scope: string, j: number) => (
                          <Badge key={j} variant="outline" className="text-xs">{scope}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {description && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Description</div>
                <div className="text-xs bg-muted/30 p-2 rounded text-foreground/80">{description}</div>
              </div>
            )}
            {creators.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Creators</div>
                <div className="space-y-2">
                  {creators.map((creator: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                      <SolanaAddressDisplay address={creator.address} displayAbbreviatedAddress highlightable showCopyButton className="text-xs" />
                      <div className="flex items-center gap-2">
                        <Badge variant={creator.verified ? 'default' : 'outline'} className="text-xs">{creator.share}%</Badge>
                        {creator.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {royalty && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Royalty</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">{royalty.percent || royalty.basis_points / 100}% Royalty</Badge>
                  <Badge variant="outline" className="text-xs">{royalty.royalty_model} model</Badge>
                  {royalty.locked && <Badge className="text-xs">Locked</Badge>}
                </div>
              </div>
            )}
            {/* Links */}
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-2">Links</div>
              <div className="flex gap-2 flex-wrap">
                <Button variant={ButtonVariant.OUTLINE} href={`https://explorer.solana.com/address/${id}`} newTab className="text-xs py-1 h-auto">Explorer</Button>
                <Button variant={ButtonVariant.OUTLINE} href={`https://magiceden.io/item-details/${id}`} newTab className="text-xs py-1 h-auto">Magic Eden</Button>
                {nft?.content?.links?.external_url && (
                  <Button variant={ButtonVariant.OUTLINE} href={nft.content.links.external_url} newTab className="text-xs py-1 h-auto">Website</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NFTContent 