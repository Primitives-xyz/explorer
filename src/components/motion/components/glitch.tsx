import { PowerGlitchOptions, RecursivePartial } from 'powerglitch'
import { useGlitch } from 'react-powerglitch'

interface Props {
  children: React.ReactNode
  options?: RecursivePartial<PowerGlitchOptions>
}

export function Glitch({ children, options }: Props) {
  const glitch = useGlitch(options)

  return <div ref={glitch.ref}>{children}</div>
}
