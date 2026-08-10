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
const SCROLL_INDICATOR_FADE_START_PX = 24
const SCROLL_INDICATOR_FADE_END_PX = 140

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

export function HeroImageSection() {
  return (
    <section id="home" className="hero-section">
      <img
        className="hero-section__image"
        src={heroImage}
        width="1800"
        height="1350"
        alt={`${invitation.couple.groom}과 ${invitation.couple.bride}의 웨딩 이미지`}
      />
      <div className="hero-section__content">
        <h1 className="hero-section__title">
          {invitation.couple.bride}과 {invitation.couple.groom}
        </h1>
      </div>
    </section>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef(new Map<string, HTMLVideoElement>())
  const animationFrameRef = useRef<number | null>(null)
  const pendingStoryIdRef = useRef<string | null>(null)
  const pressStartedAtRef = useRef(0)
  const pressStartPointRef = useRef<PressPoint | null>(null)
  const didMoveRef = useRef(false)

  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [readyStoryIds, setReadyStoryIds] = useState<Set<string>>(
    () => new Set(),
  )
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
  const nextStory =
    availableStories.length > 1
      ? availableStories[(activeIndex + 1) % availableStories.length]
      : null
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
  const renderedStories = availableStories.filter(
    (story) => story.id === activeStory?.id || story.id === nextStory?.id,
  )

  const completeStoryTransition = useCallback(
    (nextIndex: number, nextStoryId: string) => {
      if (!activeStory || nextStoryId === activeStory.id) {
        return
      }

      const currentVideo = videoRefs.current.get(activeStory.id)
      const nextVideo = videoRefs.current.get(nextStoryId)
      if (!nextVideo) {
        return
      }

      currentVideo?.pause()
      nextVideo.currentTime = 0
      pendingStoryIdRef.current = null
      setReadyStoryIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.add(nextStoryId)
        return nextIds
      })
      setProgress(0)
      setActiveIndex(nextIndex)
    },
    [activeStory],
  )

  const goToNextStory = useCallback(() => {
    if (availableStories.length === 0) {
      return
    }

    if (availableStories.length === 1) {
      const video = activeStory
        ? videoRefs.current.get(activeStory.id)
        : undefined
      if (video) {
        video.currentTime = 0
        if (shouldPlay) {
          void video.play().catch(() => setIsManuallyPaused(true))
        }
      }
      return
    }

    if (pendingStoryIdRef.current !== null) {
      return
    }

    const nextIndex = (activeIndex + 1) % availableStories.length
    const targetStory = availableStories[nextIndex]
    const targetVideo = targetStory
      ? videoRefs.current.get(targetStory.id)
      : undefined
    if (!targetStory || !targetVideo) {
      return
    }

    if (targetVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      completeStoryTransition(nextIndex, targetStory.id)
      return
    }

    pendingStoryIdRef.current = targetStory.id
    targetVideo.load()
  }, [
    activeIndex,
    activeStory,
    availableStories,
    completeStoryTransition,
    shouldPlay,
  ])

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
    let frameId: number | null = null

    const updateIndicatorOpacity = () => {
      const indicator = scrollIndicatorRef.current
      if (indicator) {
        const fadeProgress = Math.min(
          Math.max(
            (window.scrollY - SCROLL_INDICATOR_FADE_START_PX) /
              (SCROLL_INDICATOR_FADE_END_PX - SCROLL_INDICATOR_FADE_START_PX),
            0,
          ),
          1,
        )
        indicator.style.opacity = String(1 - fadeProgress)
      }
      frameId = null
    }

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateIndicatorOpacity)
      }
    }

    updateIndicatorOpacity()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  useEffect(() => {
    if (!activeStory) {
      return
    }

    const video = videoRefs.current.get(activeStory.id)
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
      const video = videoRefs.current.get(activeStory.id)
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
    if (!nextStory) {
      return
    }

    const nextVideo = videoRefs.current.get(nextStory.id)
    if (
      nextVideo &&
      nextVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      nextVideo.load()
    }
  }, [nextStory])

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
    if (activeStory) {
      videoRefs.current.get(activeStory.id)?.pause()
    }
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

  const handleVideoCanPlay = (storyId: string) => {
    setReadyStoryIds((currentIds) => {
      if (currentIds.has(storyId)) {
        return currentIds
      }

      const nextIds = new Set(currentIds)
      nextIds.add(storyId)
      return nextIds
    })

    if (pendingStoryIdRef.current !== storyId) {
      return
    }

    const nextIndex = availableStories.findIndex(
      (story) => story.id === storyId,
    )
    if (nextIndex >= 0) {
      completeStoryTransition(nextIndex, storyId)
    }
  }

  const handleVideoError = (storyId: string) => {
    const failedIndex = availableStories.findIndex(
      (story) => story.id === storyId,
    )
    const wasActiveStory = activeStory?.id === storyId

    if (pendingStoryIdRef.current === storyId) {
      pendingStoryIdRef.current = null
    }
    setFailedStoryIds((currentIds) => {
      const nextIds = new Set(currentIds)
      nextIds.add(storyId)
      return nextIds
    })
    setReadyStoryIds((currentIds) => {
      const nextIds = new Set(currentIds)
      nextIds.delete(storyId)
      return nextIds
    })

    if (wasActiveStory) {
      setProgress(0)
      setActiveIndex(
        failedIndex >= availableStories.length - 1 ? 0 : failedIndex,
      )
    }
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

      {renderedStories.map((story) => {
        const isActive = story.id === activeStory?.id
        const classNames = [
          'hero-story__video',
          isActive && readyStoryIds.has(story.id) ? 'is-active' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <video
            aria-label={isActive ? story.label : undefined}
            aria-hidden={!isActive}
            className={classNames}
            key={story.id}
            muted
            onCanPlay={() => handleVideoCanPlay(story.id)}
            onEnded={() => {
              if (isActive) {
                goToNextStory()
              }
            }}
            onError={() => handleVideoError(story.id)}
            playsInline
            preload="auto"
            ref={(video) => {
              if (video) {
                videoRefs.current.set(story.id, video)
              } else {
                videoRefs.current.delete(story.id)
              }
            }}
          >
            <source src={story.src} />
          </video>
        )
      })}

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

      <div
        className="hero-scroll-indicator"
        aria-hidden="true"
        ref={scrollIndicatorRef}
      >
        <span>아래로 스크롤</span>
        <svg viewBox="0 0 24 14" aria-hidden="true">
          <path d="m3 3 9 8 9-8" />
        </svg>
      </div>
    </section>
  )
}
