import { parsers } from '@/utils/api-params'
import { Helius } from 'helius-sdk'
import {
  AssetSortBy,
  AssetSortDirection,
} from 'helius-sdk/dist/src/types/enums'

/**
 * Initialize Helius client with API key from environment variables
 * @returns Initialized Helius client
 * @throws Error if API key is not set
 */
export const initHeliusClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY
  if (!apiKey) {
    throw new Error('HELIUS_API_KEY is not set in environment variables')
  }
  return new Helius(apiKey)
}

// Define valid options for sorting parameters
export const VALID_SORT_BY_OPTIONS = Object.values(AssetSortBy)
export const VALID_SORT_DIRECTION_OPTIONS = Object.values(AssetSortDirection)

/**
 * Parse string to boolean
 * @param param String parameter value
 * @returns Boolean value (true if param === 'true', false otherwise)
 */
export const parseBooleanParam = parsers.boolean

/**
 * Parse and validate sorting parameters for Helius API
 * @param sortBy Sort by parameter
 * @param sortDirection Sort direction parameter
 * @returns Object with validated sorting parameters or empty object
 */
export const parseSortingParams = (
  sortBy: string | null,
  sortDirection: string | null
) => {
  const sortByParser = parsers.enum(
    VALID_SORT_BY_OPTIONS as readonly AssetSortBy[]
  )
  const sortDirectionParser = parsers.enum(
    VALID_SORT_DIRECTION_OPTIONS as readonly AssetSortDirection[]
  )

  const validSortBy = sortByParser(sortBy)
  const validSortDirection = sortDirectionParser(sortDirection)

  return validSortBy && validSortDirection
    ? { sortBy: { sortBy: validSortBy, sortDirection: validSortDirection } }
    : {}
}
