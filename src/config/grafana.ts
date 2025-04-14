import { GrafanaConfig } from '../types/grafana'

export const grafanaConfig: GrafanaConfig = {
  PUSH_URL: process.env.GRAFANA_PUSH_URL || 'http://localhost:3000/api/grafana',
  USER_ID: process.env.GRAFANA_USER_ID || '',
  API_KEY: process.env.GRAFANA_API_KEY || '',
}
