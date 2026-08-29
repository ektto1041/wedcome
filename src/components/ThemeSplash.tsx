import { useEffect, useRef, useState } from 'react'
import splashImage from '../assets/images/wedding-card-splash-optimized.jpg'
import { invitation } from '../data/invitation'
import type { InvitationAssetStatus } from '../hooks/useInvitationAssetPreload'

type ThemeSplashProps = {
  assetLoadStatus: InvitationAssetStatus
  onComplete: () => void
  onOpen: () => void
  onRetry: () => void
}

const SPLASH_EXIT_DURATION_MS = 520

export function ThemeSplash({
  assetLoadStatus,
  onComplete,
  onOpen,
  onRetry,
}: ThemeSplashProps) {
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
    if (isLeaving || assetLoadStatus !== 'ready') {
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
    <section
      className={`theme-splash ${isLeaving ? 'is-leaving' : ''}`}
      aria-label="영진과 상연의 청첩장 시작 화면"
    >
      <button
        aria-label="청첩장 열기"
        className="theme-splash__surface"
        disabled={assetLoadStatus !== 'ready'}
        onClick={closeSplash}
        type="button"
      />

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

      <button
        aria-live="polite"
        className={`theme-splash__prompt is-${assetLoadStatus}`}
        disabled={assetLoadStatus === 'loading'}
        onClick={(event) => {
          event.stopPropagation()

          if (assetLoadStatus === 'error') {
            onRetry()
          } else {
            closeSplash()
          }
        }}
        type="button"
      >
        {assetLoadStatus === 'loading' ? (
          <span className="theme-splash__loading-label">
            <span className="theme-splash__spinner" aria-hidden="true" />
            청첩장 준비 중
          </span>
        ) : (
          <span className="theme-splash__prompt-text">
            {assetLoadStatus === 'error'
              ? '불러오지 못했어요 · 다시 시도'
              : '청첩장 확인하기'}
          </span>
        )}
      </button>
    </section>
  )
}
