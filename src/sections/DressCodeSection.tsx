import { useEffect, useRef, useState } from 'react'
import guestsTwoImage from '../assets/images/dress-code-guests-2.jpg'
import guestsFourImage from '../assets/images/dress-code-guests-4.jpg'
import guestsSixImage from '../assets/images/dress-code-guests-6.jpg'
import guestsEightImage from '../assets/images/dress-code-guests-8.jpg'
import { SectionTitle } from '../components/SectionTitle'

const dressCodeFrames = [
  { guestCount: 2, src: guestsTwoImage },
  { guestCount: 4, src: guestsFourImage },
  { guestCount: 6, src: guestsSixImage },
  { guestCount: 8, src: guestsEightImage },
] as const

export function DressCodeSection() {
  const storyRef = useRef<HTMLDivElement>(null)
  const [activeFrameIndex, setActiveFrameIndex] = useState(0)

  useEffect(() => {
    const story = storyRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId: number | null = null

    const updateFrame = () => {
      if (reducedMotion.matches) {
        setActiveFrameIndex(dressCodeFrames.length - 1)
        frameId = null
        return
      }

      const rect = story?.getBoundingClientRect()
      if (!story || !rect) {
        frameId = null
        return
      }

      const animationStart = window.innerHeight * 0.9
      const animationDistance = window.innerHeight * 0.75 + rect.height
      const progress = Math.min(
        Math.max((animationStart - rect.top) / animationDistance, 0),
        1,
      )
      const nextFrame = Math.min(
        dressCodeFrames.length - 1,
        Math.floor(progress * dressCodeFrames.length),
      )

      setActiveFrameIndex((currentFrame) =>
        currentFrame === nextFrame ? currentFrame : nextFrame,
      )
      frameId = null
    }

    const requestFrameUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateFrame)
      }
    }

    updateFrame()
    window.addEventListener('scroll', requestFrameUpdate, { passive: true })
    window.addEventListener('resize', requestFrameUpdate)
    reducedMotion.addEventListener('change', requestFrameUpdate)

    return () => {
      window.removeEventListener('scroll', requestFrameUpdate)
      window.removeEventListener('resize', requestFrameUpdate)
      reducedMotion.removeEventListener('change', requestFrameUpdate)
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <section
      id="dress-code"
      className="content-narrow section wedding-dress-code"
    >
      <div className="wedding-dress-code__story" ref={storyRef}>
        <figure className="wedding-dress-code__figure">
          <div className="wedding-dress-code__scene">
            {dressCodeFrames.map((frame, index) => (
              <img
                alt=""
                aria-hidden="true"
                className={index === activeFrameIndex ? 'is-active' : ''}
                decoding="async"
                key={frame.guestCount}
                loading="lazy"
                src={frame.src}
              />
            ))}
          </div>
          <figcaption className="visually-hidden">
            신랑 신부 곁으로 베이지와 브라운 계열의 옷을 입은 하객들이 두 명씩
            모여 단체 사진을 완성합니다.
          </figcaption>
        </figure>
      </div>
      <SectionTitle
        eyebrow="Dress Code"
        title="함께 물들여 주세요"
        titleId="dress-code-title"
        description={
          <>
            베이지부터 브라운까지,
            <br />
            따뜻한 색으로 함께해 주세요.
          </>
        }
      />
      <div className="wedding-dress-code__palette" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <p className="wedding-dress-code__helper">
        옷이나 작은 소품으로
        <br />
        가볍게 맞춰 주셔도 좋아요.
      </p>
    </section>
  )
}
