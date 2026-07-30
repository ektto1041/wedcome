import { useEffect } from 'react'

const SWIPE_THRESHOLD = 56
const TRANSITION_DURATION = 820

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - (-2 * progress + 2) ** 3 / 2
}

export function useChapterSwipeNavigation() {
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.invitation-shell')
    const coarsePointer = window.matchMedia('(pointer: coarse)')

    if (!shell || !coarsePointer.matches) {
      return
    }

    const chapters = Array.from(
      shell.querySelectorAll<HTMLElement>(':scope > section'),
    )

    if (chapters.length === 0) {
      return
    }

    let touchStartY = 0
    let touchCurrentY = 0
    let activeChapter: HTMLElement | null = null
    let allowChapterContentScroll = false
    let allowNativeGesture = false
    let blockGesture = false
    let isTransitioning = false
    let animationFrameId: number | null = null

    document.documentElement.classList.add('chapter-swipe-navigation')

    const canScrollChapterContent = (
      chapter: HTMLElement,
      swipeDirection: number,
    ) => {
      const maxScrollTop = chapter.scrollHeight - chapter.clientHeight

      if (maxScrollTop <= 1) {
        return false
      }

      if (swipeDirection > 0) {
        return chapter.scrollTop < maxScrollTop - 1
      }

      return chapter.scrollTop > 1
    }

    const scrollToChapter = (chapter: HTMLElement) => {
      const startY = window.scrollY
      const targetY = chapter.getBoundingClientRect().top + startY
      const distance = targetY - startY
      const startedAt = performance.now()

      isTransitioning = true

      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / TRANSITION_DURATION, 1)
        window.scrollTo({
          top: startY + distance * easeInOutCubic(progress),
          behavior: 'auto',
        })

        if (progress < 1) {
          animationFrameId = window.requestAnimationFrame(animate)
          return
        }

        animationFrameId = null
        isTransitioning = false
      }

      animationFrameId = window.requestAnimationFrame(animate)
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return
      }

      touchStartY = event.touches[0].clientY
      touchCurrentY = touchStartY
      activeChapter =
        (event.target as Element | null)?.closest<HTMLElement>(
          '.hero-section, .section',
        ) ?? null
      allowChapterContentScroll = false
      allowNativeGesture = Boolean(
        (event.target as Element | null)?.closest('.naver-map'),
      )
      blockGesture = isTransitioning
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return
      }

      touchCurrentY = event.touches[0].clientY

      if (allowNativeGesture) {
        return
      }

      if (blockGesture || isTransitioning) {
        event.preventDefault()
        return
      }

      const swipeDirection = Math.sign(touchStartY - touchCurrentY)

      if (
        swipeDirection !== 0 &&
        activeChapter &&
        canScrollChapterContent(activeChapter, swipeDirection)
      ) {
        allowChapterContentScroll = true
        return
      }

      event.preventDefault()
    }

    const handleTouchEnd = () => {
      const swipeDistance = touchStartY - touchCurrentY

      if (
        allowNativeGesture ||
        blockGesture ||
        isTransitioning ||
        allowChapterContentScroll ||
        !activeChapter ||
        Math.abs(swipeDistance) < SWIPE_THRESHOLD
      ) {
        blockGesture = false
        return
      }

      const currentIndex = chapters.indexOf(activeChapter)
      const nextIndex = currentIndex + Math.sign(swipeDistance)
      const nextChapter = chapters[nextIndex]

      if (nextChapter) {
        scrollToChapter(nextChapter)
      }

      blockGesture = false
    }

    shell.addEventListener('touchstart', handleTouchStart, { passive: true })
    shell.addEventListener('touchmove', handleTouchMove, { passive: false })
    shell.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      shell.removeEventListener('touchstart', handleTouchStart)
      shell.removeEventListener('touchmove', handleTouchMove)
      shell.removeEventListener('touchend', handleTouchEnd)
      document.documentElement.classList.remove('chapter-swipe-navigation')

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])
}
