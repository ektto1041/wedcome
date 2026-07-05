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
    <section className="content-narrow section">
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
        <div className="train-guide__header">
          <p className="train-guide__eyebrow">Train</p>
          <h3 id="train-guide-title">서울에서 기차로 오시는 길</h3>
        </div>
        <div className="train-route-list">
          {invitation.transportation.trainRoutes.map((route) => (
            <article className="train-route" key={route.station}>
              <p className="train-route__station">{route.station} 출발</p>
              <p className="train-route__summary">{route.summary}</p>
              <p className="train-route__note">{route.note}</p>
              <button
                className="train-route__button"
                type="button"
                onClick={() => setSelectedRouteId(route.id)}
              >
                시간표 보기
              </button>
            </article>
          ))}
        </div>
        <p className="train-guide__arrival">
          {invitation.transportation.arrivalNote}
        </p>
        <a
          className="train-guide__link"
          href={invitation.transportation.trainBookingUrl}
          target="_blank"
          rel="noreferrer"
        >
          코레일에서 열차 조회하기
        </a>
        <p className="train-guide__helper">
          {invitation.transportation.bookingNote}
        </p>
      </section>
      <TrainRouteDrawer
        route={selectedRoute}
        onClose={() => setSelectedRouteId(null)}
      />
    </section>
  )
}
