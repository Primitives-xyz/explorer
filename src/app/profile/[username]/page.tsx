'use client'
import { ProfileView } from '@/components/profile/profile-view'
import { useParams } from 'next/navigation'

// Async server component
export default function ProfilePage() {
  // Use the useParams hook to get the username from the URL
  const params = useParams()
  const username = params.username as string

  return <ProfileView username={username} />
}
