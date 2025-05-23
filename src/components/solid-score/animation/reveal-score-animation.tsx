import { MangaPageTransition } from '@/components/solid-score/animation/manga-page-transition'
import { Button } from '@/components/ui'
import { useState } from 'react'
import { RevealScoreText } from './reveal-score-text'

const holdDuration = 1

export function RevealScoreAnimation() {
  const [show, setShow] = useState(false)

  const handleClick = () => {
    setShow(true)

    setTimeout(() => {
      setShow(false)
    }, holdDuration * 1000)
  }

  return (
    <div>
      <Button onClick={handleClick}>Trigger Animation</Button>
      <MangaPageTransition
        triggerAnimation={handleClick}
        // color="#242F40"
        color="#69626D"
        duration={0.3}
        // holdDuration={0.5}
        direction="left-to-right"
      />
      <MangaPageTransition
        triggerAnimation={handleClick}
        // color="#363636"
        color="#ADD2C2"
        delay={0.2}
        duration={0.4}
        // holdDuration={0.5}
        direction="left-to-right"
      />
      <MangaPageTransition
        triggerAnimation={handleClick}
        color="#fff700"
        delay={0.4}
        duration={0.4}
        holdDuration={0.5}
        direction="left-to-right"
      />
      {/* <MangaPageTransition
        triggerAnimation={handleClick}
        color="#fff700"
        duration={0.4}
        holdDuration={holdDuration}
        direction="left-to-right"
      /> */}
      <RevealScoreText show={show} />
    </div>
  )
}
