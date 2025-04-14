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

    return NextResponse.json(assets)
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch assets')
  }
}

const createErrorResponse = (
  error: unknown,
  customMessage?: string,
  statusCode = 500
) => {
  console.error('API Error:', error)

  const errorMessage =
    customMessage || 'An error occurred processing your request'
  const detailedMessage = error instanceof Error ? error.message : String(error)

  return Response.json(
    {
      error: errorMessage,
      message: detailedMessage,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}
