import type { BirdeyeTokenOverview } from '@/hooks/use-birdeye-token-overview'
import { formatNumber } from '@/utils/format'

interface Authority {
  address: string
  scopes: string[]
}

interface TokenInformationProps {
  id: string
  overview?: BirdeyeTokenOverview
  decimals: number
  tokenProgram: string
  authorities: Authority[]
}

export function TokenInformation({
  id,
  overview,
  decimals,
  tokenProgram,
  authorities,
}: TokenInformationProps) {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Market Information */}
      <div className="space-y-3">
        <h4 className="text-lg font-mono text-green-500 mb-3">Market Info</h4>
        {[
          { label: 'Token Address', value: id },
          { label: 'Decimals', value: decimals },
          { label: 'Token Program', value: tokenProgram },
          { label: 'Markets', value: overview?.numberMarkets || 'N/A' },
          {
            label: 'Circulating Supply',
            value: overview
              ? `${formatNumber(overview.circulatingSupply)} (${formatNumber(
                  (overview.circulatingSupply / overview.supply) * 100,
                  2,
                )}%)`
              : 'N/A',
          },
          {
            label: 'Total Supply',
            value: overview ? formatNumber(overview.supply) : 'N/A',
          },
        ].map((item, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-green-500/60 text-sm">{item.label}</span>
            <span className="font-mono text-green-400 break-all">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Social Links */}
      {overview?.extensions && (
        <div className="pt-4 border-t border-green-800/40">
          <h4 className="text-lg font-mono text-green-500 mb-3">Links</h4>
          <div className="space-y-3">
            {[
              {
                label: 'Website',
                value: overview.extensions.website,
              },
              {
                label: 'Twitter',
                value: overview.extensions.twitter,
              },
              {
                label: 'Discord',
                value: overview.extensions.discord,
              },
              {
                label: 'Telegram',
                value: overview.extensions.telegram || undefined,
              },
              {
                label: 'Medium',
                value: overview.extensions.medium,
              },
            ]
              .filter((item) => item.value)
              .map((item, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-green-500/60 text-sm">
                    {item.label}
                  </span>
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-green-400 hover:text-green-300 transition-colors break-all"
                  >
                    {item.value}
                  </a>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Authority Info */}
      <div className="pt-4 border-t border-green-800/40">
        <h4 className="text-lg font-mono text-green-500 mb-3">Authority</h4>
        <div className="space-y-4">
          {authorities.map((authority, i) => (
            <div key={i} className="space-y-2">
              <div className="flex flex-col">
                <span className="text-green-500/60 text-sm">Address</span>
                <span className="font-mono text-green-400 break-all">
                  {authority.address}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-green-500/60 text-sm">Scopes</span>
                <div className="flex flex-wrap gap-2">
                  {authority.scopes.map((scope: string, j: number) => (
                    <span
                      key={j}
                      className="px-2 py-1 bg-green-500/10 rounded-md text-green-400 text-sm"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
