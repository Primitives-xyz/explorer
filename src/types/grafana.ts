export interface GrafanaConfig {
  PUSH_URL: string
  USER_ID: string
  API_KEY: string
}

export interface GrafanaMetric {
  name: string
  value: number | string
  timestamp: number
  tags: Record<string, string | number>
}

export interface ErrorLog {
  message: string
  error?: Error
  endpoint?: string
  timestamp: Date
  metadata?: Record<string, any>
  severity: 'error' | 'warning' | 'info'
  source: string
}
