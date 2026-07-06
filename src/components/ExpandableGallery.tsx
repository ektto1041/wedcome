import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type GalleryImage = {
  id: string
  src: string
  alt: string
}

type GalleryPhase = 'collapsed' | 'expanding' | 'expanded' | 'closing'

type ExpandableGalleryProps = {
  images: readonly GalleryImage[]
}

const EXPAND_DURATION_MS = 220
const CLOSE_DURATION_MS = 260

export function ExpandableGallery({ images }: ExpandableGalleryProps) {
  const expandTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const [phase, setPhase] = useState<GalleryPhase>('collapsed')

  const previewImages = useMemo(() => images.slice(0, 3), [images])
  const remainingImages = useMemo(() => images.slice(3), [images])
  const isOverlayVisible = phase !== 'collapsed'

  const closeGallery = useCallback(() => {
    if (phase === 'collapsed' || phase === 'closing') {
      return
    }

    clearTimer(expandTimerRef)
    setPhase('closing')

    closeTimerRef.current = window.setTimeout(() => {
      setPhase('collapsed')
      closeTimerRef.current = null
    }, CLOSE_DURATION_MS)
  }, [phase])

  useEffect(() => {
    if (phase === 'collapsed') {
      document.body.classList.remove('is-gallery-open')
      return
    }

    document.body.classList.add('is-gallery-open')

    return () => {
      document.body.classList.remove('is-gallery-open')
    }
  }, [phase])

  useEffect(() => {
    return () => {
      clearTimer(expandTimerRef)
      clearTimer(closeTimerRef)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'expanded') {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeGallery()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeGallery, phase])

  const openGallery = () => {
    if (previewImages.length < 3 || phase !== 'collapsed') {
      return
    }

    clearTimer(expandTimerRef)
    setPhase('expanding')

    expandTimerRef.current = window.setTimeout(() => {
      setPhase('expanded')
      expandTimerRef.current = null
    }, EXPAND_DURATION_MS)
  }

  return (
    <div className="expandable-gallery">
      <button
        className="gallery-preview-trigger"
        type="button"
        aria-label="갤러리 열기"
        onClick={openGallery}
      >
        <PreviewGrid images={previewImages} />
      </button>

      {isOverlayVisible ? (
        <div
          className={['gallery-overlay-frame', `is-${phase}`].join(' ')}
          role="dialog"
          aria-modal="true"
          aria-label="웨딩 갤러리"
        >
          <button
            className="gallery-overlay-close"
            type="button"
            aria-label="갤러리 닫기"
            onClick={closeGallery}
          >
            <span aria-hidden="true">×</span>
          </button>

          <div className="gallery-overlay-scroll">
            <HeroTrioBlock images={previewImages} />

            {remainingImages.length > 0 ? (
              <div className="gallery-image-stream">
                {remainingImages.map((image) => (
                  <img
                    key={image.id}
                    className="gallery-stream-image"
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PreviewGrid({ images }: { images: readonly GalleryImage[] }) {
  return (
    <span className="gallery-preview-grid" aria-hidden="true">
      {images.map((image, index) => (
        <span
          key={image.id}
          className={`gallery-preview-tile gallery-preview-tile--${index + 1}`}
        >
          <img
            src={image.src}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </span>
      ))}
    </span>
  )
}

function HeroTrioBlock({ images }: { images: readonly GalleryImage[] }) {
  return (
    <div className="gallery-hero-trio">
      {images.map((image, index) => (
        <figure
          key={image.id}
          className={`gallery-hero-card gallery-hero-card--${index + 1}`}
        >
          <img src={image.src} alt={image.alt} />
        </figure>
      ))}
    </div>
  )
}

function clearTimer(timerRef: { current: number | null }) {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current)
    timerRef.current = null
  }
}
