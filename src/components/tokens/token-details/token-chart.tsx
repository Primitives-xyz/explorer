interface TokenChartProps {
  tokenId: string
}

export function TokenChart({ tokenId }: TokenChartProps) {
  return (
    <div className="bg-black/40 border border-green-800/40 rounded-xl overflow-hidden  h-[400px]">
      <iframe
        width="100%"
        height="100%"
        src={`https://birdeye.so/tv-widget/${tokenId}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&theme=dark&defaultMetric=mcap`}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  )
}
