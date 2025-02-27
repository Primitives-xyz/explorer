import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function CommentWall({ username }: { username: string }) {
  // In a real app, you'd fetch the comments for the user
  const comments = [
    { author: "CryptoFan", content: "Great analysis on the latest token!", date: "2023-06-01" },
    { author: "BlockchainBuff", content: "Love your NFT collection!", date: "2023-05-30" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment Wall</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={index} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={comment.author} />
                <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{comment.author}</p>
                <p className="text-sm text-muted-foreground">{comment.date}</p>
                <p className="mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex space-x-2">
          <Input placeholder="Write a comment..." />
          <Button>Post</Button>
        </div>
      </CardContent>
    </Card>
  )
}

