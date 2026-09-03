import { useEffect, useRef, useState } from 'react'
import { NaverMap } from '../components/NaverMap'
import { SectionTitle } from '../components/SectionTitle'
import { TrainRouteDrawer } from '../components/TrainRouteDrawer'
import { invitation } from '../data/invitation'
import { trainRoutes } from '../data/trainRoutes'

type WeddingInfoSectionProps = {
  onVisible?: () => void
}

export function WeddingInfoSection({ onVisible }: WeddingInfoSectionProps) {
  const [isTrainDrawerOpen, setIsTrainDrawerOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !onVisible) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible()
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [onVisible])

  return (
    <section
      id="wedding-info"
      className="content-narrow section wedding-info-section"
      ref={sectionRef}
    >
      <SectionTitle eyebrow="Schedule" title="예식 안내" />
      <dl className="info-list">
        <div>
          <dt>일시</dt>
          <dd className="info-list__date">{invitation.wedding.dateLabel}</dd>
        </div>
        <div>
          <dt>장소</dt>
          <dd>{invitation.wedding.venueName}</dd>
        </div>
        <div>
          <dt>주소</dt>
          <dd>{invitation.wedding.address}</dd>
        </div>
        <div className="info-list__action">
          <dt>기차 시간표</dt>
          <dd>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setIsTrainDrawerOpen(true)}
            >
              보기
            </button>
          </dd>
        </div>
      </dl>
      <NaverMap
        venueName={invitation.wedding.venueName}
        coordinates={invitation.wedding.coordinates}
        mapUrl={invitation.wedding.mapUrl}
      />
      <TrainRouteDrawer
        routes={trainRoutes}
        isOpen={isTrainDrawerOpen}
        onClose={() => setIsTrainDrawerOpen(false)}
      />
    </section>
  )
}
