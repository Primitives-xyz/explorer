import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FollowList({ username }: { username: string }) {
  // In a real app, you'd fetch the followers and following lists for the user
  const followers = [
    { username: "CryptoEnthusiast", avatarUrl: "/placeholder.svg?height=40&width=40" },
    { username: "BlockchainDev", avatarUrl: "/placeholder.svg?height=40&width=40" },
  ]

  const following = [
    { username: "NFTCollector", avatarUrl: "/placeholder.svg?height=40&width=40" },
    { username: "TokenTrader", avatarUrl: "/placeholder.svg?height=40&width=40" },
  ]

  const FollowItem = ({ user }: { user: { username: string; avatarUrl: string } }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Avatar>
          <AvatarImage src={user.avatarUrl} alt={user.username} />
          <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span>{user.username}</span>
      </div>
      <Button variant="outline" size="sm">
        Follow
      </Button>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="followers">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="followers">
            <div className="space-y-4 mt-4">
              {followers.map((follower, index) => (
                <FollowItem key={index} user={follower} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="following">
            <div className="space-y-4 mt-4">
              {following.map((followedUser, index) => (
                <FollowItem key={index} user={followedUser} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

