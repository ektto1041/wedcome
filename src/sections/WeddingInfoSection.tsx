import { useState } from 'react'
import { NaverMap } from '../components/NaverMap'
import { SectionTitle } from '../components/SectionTitle'
import { TrainRouteDrawer } from '../components/TrainRouteDrawer'
import { invitation } from '../data/invitation'
import { trainRoutes } from '../data/trainRoutes'

export function WeddingInfoSection() {
  const [isTrainDrawerOpen, setIsTrainDrawerOpen] = useState(false)

  return (
    <section
      id="wedding-info"
      className="content-narrow section wedding-info-section"
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
