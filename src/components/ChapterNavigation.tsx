import { type MouseEvent, useEffect, useState } from 'react'

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
  const activeChapterIndex = chapters.findIndex(
    (chapter) => chapter.id === activeChapterId,
  )

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

  const handleNavigate = (
    event: MouseEvent<HTMLAnchorElement>,
    chapterId: ChapterId,
  ) => {
    event.preventDefault()

    const chapter = document.getElementById(chapterId)
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    chapter?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    window.history.replaceState(null, '', `#${chapterId}`)
  }

  return (
    <nav className="chapter-navigation" aria-label="청첩장 챕터 바로가기">
      <span
        className="chapter-navigation__indicator"
        style={{
          transform: `translateX(calc(${activeChapterIndex * 100}% + ${activeChapterIndex * 2}px))`,
        }}
        aria-hidden="true"
      />
      <ul>
        {chapters.map((chapter) => {
          const isActive = activeChapterId === chapter.id

          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={isActive ? 'location' : undefined}
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
