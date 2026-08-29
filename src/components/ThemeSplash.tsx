import { useEffect, useRef, useState } from 'react'
import splashImage from '../assets/images/wedding-card-splash-optimized.jpg'
import { invitation } from '../data/invitation'

type ThemeSplashProps = {
  onComplete: () => void
  onOpen: () => void
}

const SPLASH_EXIT_DURATION_MS = 520

export function ThemeSplash({ onComplete, onOpen }: ThemeSplashProps) {
  const [isLeaving, setIsLeaving] = useState(false)
  const exitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    document.body.classList.add('is-splash-open')

    return () => {
      document.body.classList.remove('is-splash-open')

      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current)
      }
    }
  }, [])

  const closeSplash = () => {
    if (isLeaving) {
      return
    }

    setIsLeaving(true)
    onOpen()
    exitTimerRef.current = window.setTimeout(
      onComplete,
      SPLASH_EXIT_DURATION_MS,
    )
  }

  return (
    <button
      className={`theme-splash ${isLeaving ? 'is-leaving' : ''}`}
      aria-label="영진과 상연의 청첩장 열기"
      onClick={closeSplash}
      type="button"
    >
      <img
        alt="백년가약 글귀와 전통 혼례 가마를 그린 청첩장 그림"
        className="theme-splash__image"
        decoding="async"
        fetchPriority="high"
        src={splashImage}
      />

      <span className="theme-splash__title">
        {invitation.couple.bride}과 {invitation.couple.groom}
      </span>

      <span className="theme-splash__details">
        <span>{invitation.wedding.dateLabel}</span>
        <span>{invitation.wedding.venueName}</span>
      </span>
    </button>
  )
}
