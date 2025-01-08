export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  // Convert to seconds
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) {
    return `${seconds}s ago`
  }
  
  // Convert to minutes
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  
  // Convert to hours
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }
  
  // Convert to days
  const days = Math.floor(hours / 24)
  if (days < 30) {
    return `${days}d ago`
  }
  
  // Convert to months
  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months}mo ago`
  }
  
  // Convert to years
  const years = Math.floor(months / 12)
  return `${years}y ago`
} 