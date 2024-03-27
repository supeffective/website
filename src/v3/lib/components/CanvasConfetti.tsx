import confetti from 'canvas-confetti'
// import Confetti from 'react-confetti'
import { useEffect } from 'react'

// confetti.Promise = MyPromise;
// import { useWindowSize } from '../hooks/useWindowSize'
import { PropsOf } from '../utils/types'

export type CanvasConfettiProps = PropsOf<'div'> & {
  count?: number
  origin?: { x?: number; y?: number }
}

function fireConfetti(
  count: number,
  particleRatio: number,
  opts: {
    origin: { x?: number; y?: number }
    spread: number
    startVelocity?: number
    decay?: number
    scalar?: number
  },
) {
  confetti({
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  })
}

export const CanvasConfetti = ({
  count = 200,
  origin = {
    y: 0.7,
  },
}: CanvasConfettiProps) => {
  useEffect(() => {
    // based on the demos from https://www.kirilv.com/canvas-confetti/

    fireConfetti(count, 0.25, {
      origin,
      spread: 26,
      startVelocity: 55,
    })
    fireConfetti(count, 0.2, {
      origin,
      spread: 60,
    })
    fireConfetti(count, 0.35, {
      origin,
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })
    fireConfetti(count, 0.1, {
      origin,
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })
    fireConfetti(count, 0.1, {
      origin,
      spread: 120,
      startVelocity: 45,
    })

    fireConfetti(count, 0.05, {
      origin,
      spread: 120,
      startVelocity: 45,
    })

    setTimeout(() => {
      confetti.reset()
    }, 3000)
  }, [])

  return null
}
