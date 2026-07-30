import { useState } from 'react'
import { NaverMap } from '../components/NaverMap'
import { SectionTitle } from '../components/SectionTitle'
import { TrainRouteDrawer } from '../components/TrainRouteDrawer'
import { invitation } from '../data/invitation'
import { type TrainRouteId, trainRoutes } from '../data/trainRoutes'

export function WeddingInfoSection() {
  const [selectedRouteId, setSelectedRouteId] = useState<TrainRouteId | null>(
    null,
  )
  const selectedRoute =
    trainRoutes.find((route) => route.id === selectedRouteId) ?? null

  return (
    <section className="content-narrow section wedding-info-section">
      <SectionTitle eyebrow="Schedule" title="예식 안내" />
      <dl className="info-list">
        <div>
          <dt>일시</dt>
          <dd>{invitation.wedding.dateLabel}</dd>
        </div>
        <div>
          <dt>장소</dt>
          <dd>{invitation.wedding.venueName}</dd>
        </div>
        <div>
          <dt>주소</dt>
          <dd>{invitation.wedding.address}</dd>
        </div>
      </dl>
      <NaverMap
        venueName={invitation.wedding.venueName}
        coordinates={invitation.wedding.coordinates}
        mapUrl={invitation.wedding.mapUrl}
      />
      <section className="train-guide" aria-labelledby="train-guide-title">
        <h3 id="train-guide-title">기차 시간표</h3>
        <p className="train-guide__arrival">
          안동역에서 예식장까지 차량으로 약 15~20분
        </p>
        <div className="train-route-list">
          {trainRoutes.map((route) => (
            <button
              className="train-route__button"
              type="button"
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
            >
              {route.departureStation} 출발 시간표
            </button>
          ))}
        </div>
      </section>
      <TrainRouteDrawer
        route={selectedRoute}
        onClose={() => setSelectedRouteId(null)}
      />
    </section>
  )
}
