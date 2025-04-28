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

// infinite glitch

//  <Glitch
//       options={{
//         timing: {
//           duration: 10000,
//           // iterations: 3,
//           // easing: 'ease-in-out',
//         },
//         glitchTimeSpan: {
//           start: 0,
//           end: 0.1,
//         },
//       }}
// ></Glitch>
