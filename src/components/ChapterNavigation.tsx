import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

const chapters = [
  { id: 'home', label: '처음' },
  { id: 'invitation', label: '초대' },
  { id: 'wedding-info', label: '예식' },
  { id: 'gallery', label: '사진' },
  { id: 'gift', label: '마음' },
  { id: 'design', label: '시안' },
] as const

type ChapterId = (typeof chapters)[number]['id']

export function ChapterNavigation() {
  const [activeChapterId, setActiveChapterId] = useState<ChapterId>(
    chapters[0].id,
  )
  const [isExpanded, setIsExpanded] = useState(true)
  const navigationRef = useRef<HTMLElement>(null)
  const idleTimerRef = useRef<number | null>(null)
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
    }, 2800)
  }, [clearIdleTimer])

  const showNavigation = useCallback(() => {
    setIsExpanded(true)
    scheduleCollapse()
  }, [scheduleCollapse])

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((section): section is HTMLElement => section !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const currentSection = entries.find((entry) => entry.isIntersecting)

        if (currentSection) {
          setActiveChapterId(currentSection.target.id as ChapterId)
        }
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
      },
    )

    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

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
      className={`chapter-navigation ${
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
