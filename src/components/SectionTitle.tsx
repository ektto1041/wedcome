import { useEffect, useRef, useState } from 'react'

type SectionTitleProps = {
  eyebrow: string
  title: string
  description?: string
  titleId?: string
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  titleId,
}: SectionTitleProps) {
  const titleRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const titleElement = titleRef.current

    if (!titleElement) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        setIsVisible(true)
        observer.unobserve(entry.target)
      },
      {
        rootMargin: '0px 0px -5% 0px',
        threshold: 0.15,
      },
    )

    observer.observe(titleElement)

    return () => observer.disconnect()
  }, [])

  return (
    <header
      ref={titleRef}
      className={`section-title section-title--reveal${
        isVisible ? ' is-visible' : ''
      }`}
    >
      <p className="section-title__eyebrow">{eyebrow}</p>
      <h2 id={titleId} className="section-title__heading">
        {title}
      </h2>
      {description ? (
        <p className="section-title__description">{description}</p>
      ) : null}
    </header>
  )
}
