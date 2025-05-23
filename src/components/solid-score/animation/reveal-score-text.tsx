import { Animate } from '@/components/ui'

interface Props {
  show: boolean
}

export function RevealScoreText({ show }: Props) {
  return (
    <Animate
      isVisible={show}
      initial={{
        opacity: 0,
        x: -80,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: 50,
      }}
      transition={{
        duration: 0.2,
        // delay: 0.3,
        delay: 0.7,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
    >
      <div className="text-black text-9xl font-bold">200</div>
    </Animate>
  )
}
