import { createErrorResponse } from '@/utils/api'
import { parseQueryParams, parsers } from '@/utils/api-params'
import { initHeliusClient } from '@/utils/helius/client'
import {
  AssetSortBy,
  AssetSortDirection,
} from 'helius-sdk/dist/src/types/enums'
import { NextResponse } from 'next/server'

// Type for route context
type RouteContext = {
  params: Promise<{ id: string }>
}

// Define the query parameters interface
interface AssetQueryParams {
  showFungible: boolean
  showNativeBalance: boolean
  showCollectionMetadata: boolean
  sortBy: AssetSortBy | undefined
  sortDirection: AssetSortDirection | undefined
  page: number
  limit: number
}

export async function GET(request: Request, context: RouteContext) {
  try {
    // Initialize Helius client
    const helius = initHeliusClient()

    // Extract path parameters
    const params = await context.params
    const ownerAddress = params.id

    // Extract and parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = parseQueryParams<AssetQueryParams>(searchParams, {
      showFungible: {
        key: 'showFungible',
        parser: parsers.boolean,
        defaultValue: false,
      },
      showNativeBalance: {
        key: 'showNativeBalance',
        parser: parsers.boolean,
        defaultValue: false,
      },
      showCollectionMetadata: {
        key: 'showCollectionMetadata',
        parser: parsers.boolean,
        defaultValue: true,
      },
      sortBy: {
        key: 'sortBy',
        parser: parsers.enum(
          Object.values(AssetSortBy) as readonly AssetSortBy[]
        ),
      },
      sortDirection: {
        key: 'sortDirection',
        parser: parsers.enum(
          Object.values(AssetSortDirection) as readonly AssetSortDirection[]
        ),
      },
      page: {
        key: 'page',
        parser: parsers.number,
        defaultValue: 1,
      },
      limit: {
        key: 'limit',
        parser: parsers.number,
        defaultValue: 100,
      },
    })

    // Get before and after parameters directly
    const before = searchParams.get('before') || undefined
    const after = searchParams.get('after') || undefined

    // Create request parameters
    const requestParams: any = {
      ownerAddress,
      page: queryParams.page,
      limit: queryParams.limit,
      displayOptions: {
        showFungible: queryParams.showFungible,
        showNativeBalance: queryParams.showNativeBalance,
        showCollectionMetadata: queryParams.showCollectionMetadata,
      },
    }

    // Add pagination cursor parameters if they exist
    if (before) {
      requestParams.before = before
    }

    if (after) {
      requestParams.after = after
    }

    // Add sorting parameters if they exist
    if (queryParams.sortBy && queryParams.sortDirection) {
      requestParams.sortBy = {
        sortBy: queryParams.sortBy,
        sortDirection: queryParams.sortDirection,
      }
    }

    // Fetch assets
    const assets = await helius.rpc.getAssetsByOwner(requestParams)

    // Check if we need to prioritize owned assets    
    // First, get the list of all tokens/assets the user already owns
    const userOwnedAssets = assets.items || []

    // Now fetch the search results (assuming you have a search endpoint or functionality)
    // For example, using a hypothetical searchAssets function:
    const searchParamsAssets = {
      searchTerm: 'test',
      limit: queryParams.limit,
    }
    
    // This is a placeholder for your actual search function
    const searchResults = await helius.rpc.searchAssets(searchParamsAssets)

    console.log('searchResults --->', searchResults)
    
    // Prioritize by moving owned assets to the top
    const ownedAssetIds = new Set(userOwnedAssets.map(asset => asset.id))
    
    // Split search results into owned and not owned
    const ownedResults = searchResults?.items.filter(asset => ownedAssetIds.has(asset.id))
    const otherResults = searchResults?.items.filter(asset => !ownedAssetIds.has(asset.id))
    
    // Combine with owned assets first
    const prioritizedResults = {
      ...searchResults,
      items: [...(ownedResults ?? []), ...(otherResults ?? [])]
    }
    
    return NextResponse.json(prioritizedResults)        
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch assets')
  }
}
