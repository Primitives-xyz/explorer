import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/components-new-version/ui/card'

export default function Home() {
  return (
    <div className="grid grid-cols-[1fr_2fr_1fr] gap-4">
      <div className="pt-[100px]">
        <Card>
          <CardHeader>
            <CardTitle>Left Sidebar</CardTitle>
          </CardHeader>
          <CardContent>content</CardContent>
        </Card>
      </div>

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

      <div className="pt-[100px]">
        <Card>
          <CardHeader>
            <CardTitle>Right Sidebar</CardTitle>
          </CardHeader>
          <CardContent>content</CardContent>
        </Card>
      </div>
    </div>
  )
}
