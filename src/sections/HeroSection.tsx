import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import heroImage from '../assets/images/hero-image.jpg'
import { heroStories } from '../data/heroStories'
import { invitation } from '../data/invitation'

const TAP_MAX_DURATION_MS = 220
const TAP_MOVE_TOLERANCE_PX = 12
const HERO_VISIBILITY_THRESHOLD = 0.35

type PressPoint = {
  x: number
  y: number
}

type ProgressStyle = CSSProperties & {
  '--hero-story-progress': string
}

function getProgressStyle(progress: number): ProgressStyle {
  return {
    '--hero-story-progress': `${Math.min(Math.max(progress, 0), 1) * 100}%`,
  }
}

function HeroProgress({
  activeIndex,
  progress,
  storyIds,
}: {
  activeIndex: number
  progress: number
  storyIds: string[]
}) {
  return (
    <div className="hero-story__progress" aria-hidden="true">
      {storyIds.map((storyId, index) => {
        const segmentProgress =
          index < activeIndex ? 1 : index === activeIndex ? progress : 0

        return (
          <span className="hero-story__progress-track" key={storyId}>
            <span
              className="hero-story__progress-fill"
              style={getProgressStyle(segmentProgress)}
            />
          </span>
        )
      })}
    </div>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const pressStartedAtRef = useRef(0)
  const pressStartPointRef = useRef<PressPoint | null>(null)
  const didMoveRef = useRef(false)

  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const [isPageHidden, setIsPageHidden] = useState(document.hidden)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)
  const [hasUserStarted, setHasUserStarted] = useState(false)
  const [failedStoryIds, setFailedStoryIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const availableStories = useMemo(
    () => heroStories.filter((story) => !failedStoryIds.has(story.id)),
    [failedStoryIds],
  )
  const activeStory =
    availableStories[activeIndex] ?? availableStories.at(0) ?? null
  const motionPlaybackAllowed = !prefersReducedMotion || hasUserStarted
  const shouldPlay =
    activeStory !== null &&
    motionPlaybackAllowed &&
    !isHolding &&
    !isManuallyPaused &&
    !isPageHidden &&
    isInView
  const isPlaybackPaused =
    !motionPlaybackAllowed || isManuallyPaused || !isInView || isPageHidden

  const goToNextStory = useCallback(() => {
    if (availableStories.length === 0) {
      return
    }

    setProgress(0)

    if (availableStories.length === 1) {
      const video = videoRef.current
      if (video) {
        video.currentTime = 0
        if (shouldPlay) {
          void video.play().catch(() => setIsManuallyPaused(true))
        }
      }
      return
    }

    setIsReady(false)
    setActiveIndex(
      (currentIndex) => (currentIndex + 1) % availableStories.length,
    )
  }, [availableStories.length, shouldPlay])

  useEffect(() => {
    if (activeIndex >= availableStories.length && availableStories.length > 0) {
      setActiveIndex(0)
    }
  }, [activeIndex, availableStories.length])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
      setHasUserStarted(false)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => setIsPageHidden(document.hidden)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) =>
        setIsInView(entry.intersectionRatio >= HERO_VISIBILITY_THRESHOLD),
      { threshold: HERO_VISIBILITY_THRESHOLD },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!activeStory) {
      return
    }

    const video = videoRef.current
    if (!video) {
      return
    }

    if (!shouldPlay) {
      video.pause()
      return
    }

    void video.play().catch(() => setIsManuallyPaused(true))
  }, [activeStory, shouldPlay])

  useEffect(() => {
    if (!activeStory || !shouldPlay) {
      return
    }

    const updateProgress = () => {
      const video = videoRef.current
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        setProgress(video.currentTime / video.duration)
      }
      animationFrameRef.current = window.requestAnimationFrame(updateProgress)
    }

    animationFrameRef.current = window.requestAnimationFrame(updateProgress)
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [activeStory, shouldPlay])

  useEffect(() => {
    if (!isReady || availableStories.length < 2) {
      return
    }

    const nextIndex = (activeIndex + 1) % availableStories.length
    const nextStory = availableStories[nextIndex]
    if (!nextStory) {
      return
    }

    const preloader = document.createElement('video')
    preloader.preload = 'auto'
    preloader.muted = true
    preloader.src = nextStory.src
    preloader.load()

    return () => {
      preloader.removeAttribute('src')
      preloader.load()
    }
  }, [activeIndex, availableStories, isReady])

  const releaseHold = useCallback(() => {
    pressStartPointRef.current = null
    setIsHolding(false)
  }, [])

  useEffect(() => {
    const handleWindowBlur = () => releaseHold()
    window.addEventListener('blur', handleWindowBlur)
    return () => window.removeEventListener('blur', handleWindowBlur)
  }, [releaseHold])

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    pressStartedAtRef.current = performance.now()
    pressStartPointRef.current = { x: event.clientX, y: event.clientY }
    didMoveRef.current = false
    setIsHolding(true)
    videoRef.current?.pause()
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const startPoint = pressStartPointRef.current
    if (!startPoint) {
      return
    }

    const distance = Math.hypot(
      event.clientX - startPoint.x,
      event.clientY - startPoint.y,
    )
    if (distance > TAP_MOVE_TOLERANCE_PX) {
      didMoveRef.current = true
    }
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const pressDuration = performance.now() - pressStartedAtRef.current
    const isTap =
      pressStartPointRef.current !== null &&
      !didMoveRef.current &&
      pressDuration <= TAP_MAX_DURATION_MS

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    releaseHold()

    if (isTap) {
      goToNextStory()
    }
  }

  const handlePlaybackToggle = () => {
    if (!motionPlaybackAllowed) {
      setHasUserStarted(true)
      setIsManuallyPaused(false)
      return
    }

    setIsManuallyPaused((isPaused) => !isPaused)
  }

  const handleVideoError = () => {
    if (!activeStory) {
      return
    }

    setFailedStoryIds((currentIds) => {
      const nextIds = new Set(currentIds)
      nextIds.add(activeStory.id)
      return nextIds
    })
    setProgress(0)
    setIsReady(false)
  }

  return (
    <section id="home" className="hero-section" ref={sectionRef}>
      <img
        className="hero-section__image hero-story__fallback"
        src={heroImage}
        width="1800"
        height="1350"
        alt={`${invitation.couple.groom}과 ${invitation.couple.bride}의 웨딩 이미지`}
      />

      {activeStory && (
        <video
          aria-label={activeStory.label}
          autoPlay={!prefersReducedMotion}
          className={`hero-story__video${isReady ? ' is-ready' : ''}`}
          key={activeStory.id}
          muted
          onCanPlay={() => setIsReady(true)}
          onEnded={goToNextStory}
          onError={handleVideoError}
          playsInline
          preload="auto"
          ref={videoRef}
        >
          <source src={activeStory.src} />
        </video>
      )}

      {activeStory && (
        <>
          <HeroProgress
            activeIndex={activeIndex}
            progress={progress}
            storyIds={availableStories.map((story) => story.id)}
          />
          <p className="hero-story__status" aria-live="polite">
            총 {availableStories.length}개 중 {activeIndex + 1}번째 영상
          </p>
          <button
            aria-label="다음 영상 보기. 길게 누르면 일시정지합니다."
            className="hero-story__interaction"
            onClick={(event) => {
              if (event.detail === 0) {
                goToNextStory()
              }
            }}
            onContextMenu={(event) => event.preventDefault()}
            onKeyDown={(event) => {
              if (event.code === 'Space') {
                event.preventDefault()
                handlePlaybackToggle()
              }
            }}
            onPointerCancel={releaseHold}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            type="button"
          />
          <button
            aria-label={isPlaybackPaused ? '영상 재생' : '영상 일시정지'}
            className="hero-story__playback"
            onClick={handlePlaybackToggle}
            type="button"
          >
            {isPlaybackPaused ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.4v13.2L18.5 12 8 5.4Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
              </svg>
            )}
          </button>
        </>
      )}

      <div className="hero-section__content">
        <h1 className="hero-section__title">
          {invitation.couple.bride}과 {invitation.couple.groom}
        </h1>
      </div>
    </section>
  )
}
