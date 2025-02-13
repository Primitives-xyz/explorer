import { GrafanaConfig } from '../types/grafana'

// Constants for Grafana queries
export const GRAFANA_MEASUREMENTS = {
  ERROR_LOG: 'error_log',
} as const

export const ERROR_TAGS = {
  SOURCE: 'jupiter-swap',
  STEPS: {
    VERIFY_OUTPUT_ATA: 'verify_output_ata',
    CREATE_OUTPUT_ATA: 'create_output_ata',
    VERIFY_SSE_ATA: 'verify_sse_ata',
    CREATE_SSE_ATA: 'create_sse_ata',
    FETCH_SWAP_INSTRUCTIONS: 'fetch_swap_instructions',
    GET_LOOKUP_TABLES: 'get_lookup_tables',
    GET_BLOCKHASH: 'get_blockhash',
    CREATE_SSE_TRANSFER: 'create_sse_transfer',
    SIMULATE_TRANSACTION: 'simulate_transaction',
    UNHANDLED_ERROR: 'unhandled_error',
  },
  SEVERITY: {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
} as const

export const grafanaConfig: GrafanaConfig = {
  PUSH_URL: process.env.GRAFANA_PUSH_URL || 'http://localhost:3000/api/grafana',
  USER_ID: process.env.GRAFANA_USER_ID || '',
  API_KEY: process.env.GRAFANA_API_KEY || '',
}
