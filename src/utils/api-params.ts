/**
 * Utility functions for handling API query parameters
 */

/**
 * Parse query parameters from a URL search params object
 * @param searchParams URL search params object
 * @param config Configuration for parameter parsing
 * @returns Object with parsed parameters
 */
export function parseQueryParams<T>(
  searchParams: URLSearchParams,
  config: {
    [K in keyof T]: {
      key: string
      parser: (value: string | null) => any
      defaultValue?: any
    }
  }
): T {
  const result = {} as T

  for (const key in config) {
    const {
      key: paramKey,
      parser,
      defaultValue,
    } = config[key as keyof typeof config]
    const value = searchParams.get(paramKey)
    result[key as keyof T] = value !== null ? parser(value) : defaultValue
  }

  return result
}

/**
 * Common parameter parsers
 */
export const parsers = {
  /**
   * Parse string to boolean
   * @param value String value
   * @returns Boolean (true if value === 'true', false otherwise)
   */
  boolean: (value: string | null): boolean => value === 'true',

  /**
   * Parse string to number
   * @param value String value
   * @returns Number or undefined if invalid
   */
  number: (value: string | null): number | undefined => {
    if (value === null) return undefined
    const num = Number(value)
    return isNaN(num) ? undefined : num
  },

  /**
   * Parse string to integer
   * @param value String value
   * @returns Integer or undefined if invalid
   */
  integer: (value: string | null): number | undefined => {
    if (value === null) return undefined
    const num = parseInt(value, 10)
    return isNaN(num) ? undefined : num
  },

  /**
   * Parse comma-separated string to array
   * @param value Comma-separated string
   * @returns Array of strings or empty array if null
   */
  array: (value: string | null): string[] => {
    return value ? value.split(',').map((item) => item.trim()) : []
  },

  /**
   * Parse string to enum value
   * @param enumValues Array of valid enum values
   * @returns Function that parses string to enum value or undefined if invalid
   */
  enum:
    <T extends string>(enumValues: readonly T[]) =>
    (value: string | null): T | undefined => {
      if (!value) return undefined
      return enumValues.includes(value as T) ? (value as T) : undefined
    },
}
