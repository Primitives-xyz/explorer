import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'

export function HomeContent() {
  return (
    <div
      className="h-screen overflow-auto scrollbar-hide relative"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div className="absolute pt-[100px] w-full mb-[100px]">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="AccordionTrigger">
              <span>Trigger text</span>
            </AccordionTrigger>
            <AccordionContent className="AccordionContent">
              <p>This is the content inside the accordion</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

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
  )
}
