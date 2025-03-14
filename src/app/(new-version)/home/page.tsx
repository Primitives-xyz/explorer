import { LeftSideHome } from '@/components-new-version/home/left-side-home/left-side-home'
import { RightSideHome } from '@/components-new-version/home/right-side-home/right-side-home'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'

export default function Home() {
  return (
    <div className="grid grid-cols-[1fr_2fr_1fr] gap-4">
      <LeftSideHome />
      <div className="h-screen overflow-auto scrollbar-hide relative">
        <div className="absolute pt-[100px] w-full">
          <Card>
            <CardHeader>
              <CardTitle>Main Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle>Content {i + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>Scrollable content</CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <RightSideHome />
    </div>
  )
}
