interface GraphProps {
  id: string
}

export function Graph({ id }: GraphProps) {
  const src = `https://birdeye.so/tv-widget/${id}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&theme=dark&defaultMetric=mcap`

  return (
    <div className="h-[430px] w-full overflow-hidden rounded-card bg-card">
      <iframe
        src={src}
        title="Token Graph"
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin"
        className="rounded-lg border-0"
      />
    </div>
  )
}
