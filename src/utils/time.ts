// Helper function to normalize timestamp
export const normalizeTimestamp = (timestamp: number) => {
  // If timestamp is in seconds (less than year 2100 in milliseconds)
  if (timestamp < 4102444800) {
    return timestamp * 1000
  }
  return timestamp
}

// Format time in a concise way
export const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'now'
  } else if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60)
    return `${mins}m`
  } else if (diffInSeconds < 86400) {
    const hrs = Math.floor(diffInSeconds / 3600)
    return `${hrs}h`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d`
  }
}
