import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

const chaptersWithAttendance = [
  { id: 'home', label: '처음' },
  { id: 'invitation', label: '초대' },
  { id: 'wedding-info', label: '예식' },
  { id: 'rsvp', label: '참석' },
  { id: 'parking', label: '주차' },
  { id: 'gift', label: '마음' },
] as const

const chaptersWithoutAttendance = chaptersWithAttendance.filter(
  (chapter) => chapter.id !== 'rsvp',
)

type ChapterId = (typeof chaptersWithAttendance)[number]['id']
type ChapterNavigationProps = {
  showAttendance?: boolean
}

const NAVIGATION_IDLE_DELAY = 1400

export function ChapterNavigation({
  showAttendance = false,
}: ChapterNavigationProps) {
  const chapters = showAttendance
    ? chaptersWithAttendance
    : chaptersWithoutAttendance
  const [activeChapterId, setActiveChapterId] = useState<ChapterId>(
    chapters[0].id,
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const navigationRef = useRef<HTMLElement>(null)
  const idleTimerRef = useRef<number | null>(null)
  const positionFrameRef = useRef<number | null>(null)
  const activeChapterIndex = chapters.findIndex(
    (chapter) => chapter.id === activeChapterId,
  )

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  const scheduleCollapse = useCallback(() => {
    clearIdleTimer()
    idleTimerRef.current = window.setTimeout(() => {
      if (!navigationRef.current?.contains(document.activeElement)) {
        setIsExpanded(false)
      }
    }, NAVIGATION_IDLE_DELAY)
  }, [clearIdleTimer])

  const showNavigation = useCallback(() => {
    setIsExpanded(true)
    scheduleCollapse()
  }, [scheduleCollapse])

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((section): section is HTMLElement => section !== null)

    const updateActiveChapter = () => {
      positionFrameRef.current = null

      const activationLine = window.innerHeight * 0.42
      let nextChapterId: ChapterId = chapters[0].id

      for (const section of sections) {
        if (section.getBoundingClientRect().top > activationLine) {
          break
        }

        nextChapterId = section.id as ChapterId
      }

      const isAtPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2

      if (isAtPageEnd) {
        nextChapterId = chapters[chapters.length - 1].id
      }

      setActiveChapterId((currentId) =>
        currentId === nextChapterId ? currentId : nextChapterId,
      )
    }

    const schedulePositionUpdate = () => {
      if (positionFrameRef.current === null) {
        positionFrameRef.current =
          window.requestAnimationFrame(updateActiveChapter)
      }
    }

    const resizeObserver = new ResizeObserver(schedulePositionUpdate)
    sections.forEach((section) => {
      resizeObserver.observe(section)
    })
    window.addEventListener('scroll', schedulePositionUpdate, { passive: true })
    window.addEventListener('resize', schedulePositionUpdate)
    updateActiveChapter()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', schedulePositionUpdate)
      window.removeEventListener('resize', schedulePositionUpdate)

      if (positionFrameRef.current !== null) {
        window.cancelAnimationFrame(positionFrameRef.current)
        positionFrameRef.current = null
      }
    }
  }, [chapters])

  useEffect(() => {
    const handleScroll = () => showNavigation()

    window.addEventListener('scroll', handleScroll, { passive: true })
    scheduleCollapse()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearIdleTimer()
    }
  }, [clearIdleTimer, scheduleCollapse, showNavigation])

  const handleNavigate = (
    event: MouseEvent<HTMLAnchorElement>,
    chapterId: ChapterId,
  ) => {
    event.preventDefault()

    if (event.detail > 0) {
      event.currentTarget.blur()
    }

    const chapter = document.getElementById(chapterId)
    const scrollTarget =
      chapter?.querySelector<HTMLElement>('.section-title') ?? chapter
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    scrollTarget?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    window.history.replaceState(null, '', `#${chapterId}`)
    showNavigation()
  }

  return (
    <nav
      ref={navigationRef}
      className={`chapter-navigation ${showAttendance ? 'has-attendance' : ''} ${
        isExpanded ? 'is-expanded' : 'is-collapsed'
      }`}
      aria-label="청첩장 챕터 바로가기"
      onBlur={scheduleCollapse}
    >
      <button
        type="button"
        className="chapter-navigation__compact"
        aria-label="챕터 메뉴 펼치기"
        aria-hidden={isExpanded}
        tabIndex={isExpanded ? -1 : 0}
        onClick={(event) => {
          event.currentTarget.blur()
          showNavigation()
        }}
      >
        <span className="chapter-navigation__track">
          <span
            style={{
              transform: `translateX(${activeChapterIndex * 100}%)`,
            }}
          />
        </span>
      </button>
      <span
        className="chapter-navigation__indicator"
        style={{
          transform: `translateX(calc(${activeChapterIndex * 100}% + ${activeChapterIndex * 2}px))`,
        }}
        aria-hidden="true"
      />
      <ul aria-hidden={!isExpanded}>
        {chapters.map((chapter) => {
          const isActive = activeChapterId === chapter.id

          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={isActive ? 'location' : undefined}
                tabIndex={isExpanded ? 0 : -1}
                onFocus={() => {
                  clearIdleTimer()
                  setIsExpanded(true)
                }}
                onClick={(event) => handleNavigate(event, chapter.id)}
              >
                {chapter.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
