import { useState, useEffect, useMemo } from "react"

const TIME_UNITS = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2629746 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'min', seconds: 60 },
  { unit: 'sec', seconds: 1 }
]

const getTimeDifference = (timestamp: number): string => {
  const now = Date.now()
  console.log("now:", now)
  const diffSeconds = Math.floor((now - timestamp * 1000) / 1000)

  for (const { unit, seconds } of TIME_UNITS) {
    if (diffSeconds >= seconds) {
      const value = Math.floor(diffSeconds / seconds)
      return `${value} ${unit}${value !== 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

const getUpdateInterval = (timestamp: number): number => {
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000)

  if (diffSeconds < 60) return 1000
  if (diffSeconds < 3600) return 60000
  if (diffSeconds < 86400) return 300000
  return 3600000
}

const TimeAgo = ({ timestamp }: { timestamp: number }) => {
  const [timeAgo, setTimeAgo] = useState(() => getTimeDifference(timestamp))

  useEffect(() => {
    // Set initial time
    setTimeAgo(getTimeDifference(timestamp))

    // Use dynamic interval based on how old the timestamp is
    const updateTime = () => {
      setTimeAgo(getTimeDifference(timestamp))
      // Recalculate interval for next update
      interval = setTimeout(updateTime, getUpdateInterval(timestamp))
    }

    let interval = setTimeout(updateTime, getUpdateInterval(timestamp))

    return () => clearTimeout(interval)
  }, [timestamp])

  return <span className="text-xs">{timeAgo}</span>
}

export default TimeAgo