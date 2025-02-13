import { grafanaConfig } from '../config/grafana'
import { ErrorLog, GrafanaMetric } from '../types/grafana'

export class GrafanaService {
  private static instance: GrafanaService

  private constructor() {
    console.log(`
📊 Initializing Grafana service:
   - Push URL: ${grafanaConfig.PUSH_URL}
   - User ID: ${grafanaConfig.USER_ID}
   - API Key: ${
     grafanaConfig.API_KEY
       ? '****' + grafanaConfig.API_KEY.slice(-4)
       : 'Not set'
   }
`)
  }

  public static getInstance(): GrafanaService {
    if (!GrafanaService.instance) {
      GrafanaService.instance = new GrafanaService()
    }
    return GrafanaService.instance
  }

  private convertToLineProtocol(metric: GrafanaMetric): string {
    const tags = Object.entries(metric.tags)
      .map(([key, value]) => `${key}=${this.escapeValue(value.toString())}`)
      .join(',')

    return `${metric.name},${tags} value=${metric.value} ${metric.timestamp}`
  }

  private escapeValue(value: string): string {
    return value.replace(/,/g, '\\,').replace(/ /g, '\\ ').replace(/=/g, '\\=')
  }

  private createErrorMetric(log: ErrorLog): GrafanaMetric {
    const timestamp = log.timestamp.getTime() * 1000000 // Convert to nanoseconds

    return {
      name: 'error_log',
      value: 1,
      timestamp,
      tags: {
        severity: log.severity,
        source: log.source,
        endpoint: log.endpoint || 'unknown',
        error_type: log.error?.name || 'unknown',
        message: this.escapeValue(log.message),
        environment: process.env.NODE_ENV || 'development',
      },
    }
  }

  public async logError(
    error: Error | string,
    options: Partial<ErrorLog> = {}
  ): Promise<void> {
    const errorLog: ErrorLog = {
      message: error instanceof Error ? error.message : error,
      error: error instanceof Error ? error : undefined,
      timestamp: new Date(),
      severity: options.severity || 'error',
      source: options.source || 'application',
      endpoint: options.endpoint,
      metadata: options.metadata,
    }

    const metric = this.createErrorMetric(errorLog)
    const line = this.convertToLineProtocol(metric)

    try {
      const response = await fetch(grafanaConfig.PUSH_URL, {
        method: 'POST',
        body: line,
        headers: {
          Authorization: `Bearer ${grafanaConfig.USER_ID}:${grafanaConfig.API_KEY}`,
          'Content-Type': 'text/plain',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Failed to push error log to Grafana: ${errorText}`)
        return
      }

      console.log('✅ Successfully pushed error log to Grafana')
    } catch (error) {
      console.error('❌ Error pushing log to Grafana:', error)
      if (error instanceof Error) {
        console.error('   Details:', error.message)
      }
    }
  }
}
