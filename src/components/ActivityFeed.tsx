import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileContentFeed } from './profile/profile-content-feed'

export default function ActivityFeed({ username }: { username: string }) {
  // In a real app, you'd fetch the activity data for the user
  const activities = [
    { type: 'follow', target: 'CryptoEnthusiast', date: '2023-06-01' },
    { type: 'comment', target: 'NFT #1234', date: '2023-05-30' },
    { type: 'like', target: 'Token Analysis Post', date: '2023-05-28' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileContentFeed username={username} />
      </CardContent>
    </Card>
  )
}
