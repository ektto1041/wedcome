import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useState,
} from 'react'
import type { TrainRoute, TrainRouteId } from '../data/trainRoutes'
import { BottomSheet } from './BottomSheet'

type TrainRouteDrawerProps = {
  routes: TrainRoute[]
  isOpen: boolean
  onClose: () => void
}

export function TrainRouteDrawer({
  routes,
  isOpen,
  onClose,
}: TrainRouteDrawerProps) {
  const [activeRouteId, setActiveRouteId] = useState<TrainRouteId>(
    routes[0]?.id ?? 'seoul',
  )
  const activeRoute =
    routes.find((route) => route.id === activeRouteId) ?? routes[0]

  useEffect(() => {
    if (isOpen) {
      setActiveRouteId(routes[0]?.id ?? 'seoul')
    }
  }, [isOpen, routes])

  const handleTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    routeId: TrainRouteId,
  ) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return
    }

    event.preventDefault()
    const currentIndex = routes.findIndex((route) => route.id === routeId)
    let nextIndex = currentIndex

    if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = routes.length - 1
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + routes.length) % routes.length
    } else if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % routes.length
    }

    const nextRoute = routes[nextIndex]
    if (nextRoute) {
      setActiveRouteId(nextRoute.id)
      document.getElementById(`train-route-tab-${nextRoute.id}`)?.focus()
    }
  }

  if (!activeRoute) {
    return null
  }

  return (
    <BottomSheet
      className="train-drawer"
      contentClassName="train-drawer__content"
      eyebrow="Train Schedule"
      isOpen={isOpen}
      onClose={onClose}
      title="안동행 기차 시간표"
    >
      <div className="train-drawer__notice" role="note">
        <strong>최신 실시간 데이터가 아닙니다.</strong>
        <p>
          현재 공개 시간표 기준 참고 정보입니다. 실제 예매 전 코레일에서
          출발일과 좌석 현황을 다시 확인해 주세요.
        </p>
      </div>

      <div className="train-route-tabs" role="tablist" aria-label="출발역">
        {routes.map((route) => {
          const isActive = route.id === activeRoute.id

          return (
            <button
              id={`train-route-tab-${route.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`train-route-panel-${route.id}`}
              tabIndex={isActive ? 0 : -1}
              key={route.id}
              onClick={() => setActiveRouteId(route.id)}
              onKeyDown={(event) => handleTabKeyDown(event, route.id)}
            >
              {route.departureStation}
            </button>
          )
        })}
      </div>

      <div
        id={`train-route-panel-${activeRoute.id}`}
        className="ticket-scroll-area"
        role="tabpanel"
        aria-labelledby={`train-route-tab-${activeRoute.id}`}
        key={activeRoute.id}
      >
        <div className="ticket-list">
          {activeRoute.tickets.map((ticket) => (
            <article
              className="ticket-card"
              key={`${activeRoute.id}-${ticket.trainNumber}-${ticket.departureTime}`}
            >
              <div className="ticket-card__top">
                <p className="ticket-card__train">
                  {ticket.trainName} {ticket.trainNumber}
                </p>
                <p className="ticket-card__fare">{ticket.adultFare}</p>
              </div>
              <div className="ticket-card__time">
                <div>
                  <span>출발</span>
                  <strong>{ticket.departureTime}</strong>
                </div>
                <p>{ticket.duration}</p>
                <div>
                  <span>도착</span>
                  <strong>{ticket.arrivalTime}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="train-drawer__footer">
        <a
          className="train-drawer__booking"
          href={activeRoute.bookingUrl}
          target="_blank"
          rel="noreferrer"
        >
          코레일에서 예매하기
        </a>
        <p>
          출발역은 {activeRoute.departureStation}, 도착역은{' '}
          {activeRoute.arrivalStation}으로 입력해 주세요.
        </p>
        <small>
          출처: {activeRoute.sourceLabel}, 최종수정{' '}
          {activeRoute.sourceUpdatedAt}
        </small>
      </div>
    </BottomSheet>
  )
}
