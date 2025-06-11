import { Button, Label } from '@/components/ui'
import { cn } from '@/utils/utils'
import { EPudgyTheme } from '../pudgy.models'

interface Props {
  selectedTheme: EPudgyTheme
  setSelectedTheme: (theme: EPudgyTheme) => void
}

export function PudgyThemeSelection({
  selectedTheme,
  setSelectedTheme,
}: Props) {
  return (
    <div className="space-y-2 gap-2">
      <Label className="mb-3">Pudgy x SSE Profile Themes</Label>
      <div className="grid grid-cols-4 gap-4">
        {Object.values(EPudgyTheme).map((theme) => (
          <Button
            isInvisible
            key={theme}
            className={cn(
              'w-full aspect-square rounded-full text-xs text-muted-foreground',
              {
                'ring-2 ring-offset-2': theme === selectedTheme,
                'background-gradient': theme === EPudgyTheme.DEFAULT,
                'background-gradient-blue': theme === EPudgyTheme.BLUE,
                'background-gradient-green': theme === EPudgyTheme.GREEN,
                'background-gradient-pink': theme === EPudgyTheme.PINK,
              }
            )}
            onClick={() => setSelectedTheme(theme)}
          >
            {theme === EPudgyTheme.DEFAULT && (
              <>
                SSE <br /> Classic
              </>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
