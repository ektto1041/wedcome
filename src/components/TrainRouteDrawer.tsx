import { useCallback, useEffect, useRef, useState } from 'react'
import type { TrainRoute } from '../data/trainRoutes'

type TrainRouteDrawerProps = {
  route: TrainRoute | null
  onClose: () => void
}

export function TrainRouteDrawer({ route, onClose }: TrainRouteDrawerProps) {
  const isOpen = Boolean(route)
  const closeTimerRef = useRef<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    if (isClosing) {
      return
    }

    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      onClose()
      setIsClosing(false)
      closeTimerRef.current = null
    }, 260)
  }, [isClosing, onClose])

  useEffect(() => {
    if (route) {
      setIsClosing(false)
    }
  }, [route])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const scrollY = window.scrollY

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    document.body.classList.add('is-drawer-open')
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('is-drawer-open')
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose, isOpen])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  if (!route) {
    return null
  }

  return (
    <div
      className={`drawer-layer ${isClosing ? 'is-closing' : 'is-opening'}`}
      aria-hidden={!isOpen}
    >
      <button
        className="drawer-backdrop"
        type="button"
        aria-label="열차 시간표 닫기"
        onClick={handleClose}
      />
      <aside
        className="train-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="train-drawer-title"
      >
        <div className="train-drawer__header">
          <div>
            <p className="train-drawer__eyebrow">Train Schedule</p>
            <h3 id="train-drawer-title">
              {route.departureStation}에서 {route.arrivalStation}
            </h3>
          </div>
          <button
            className="train-drawer__close"
            type="button"
            aria-label="열차 시간표 닫기"
            onClick={handleClose}
          >
            닫기
          </button>
        </div>

        <div className="train-drawer__notice" role="note">
          <strong>최신 실시간 데이터가 아닙니다.</strong>
          <p>
            현재 공개 시간표 기준 참고 정보입니다. 실제 예매 전 코레일에서
            출발일과 좌석 현황을 다시 확인해 주세요.
          </p>
        </div>

        <div className="ticket-scroll-area">
          <div className="ticket-list">
            {route.tickets.map((ticket) => (
              <article
                className="ticket-card"
                key={`${route.id}-${ticket.trainNumber}-${ticket.departureTime}`}
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
            href={route.bookingUrl}
            target="_blank"
            rel="noreferrer"
          >
            코레일에서 예매하기
          </a>
          <p>
            출발역은 {route.departureStation}, 도착역은 {route.arrivalStation}
            으로 입력해 주세요.
          </p>
          <small>
            출처: {route.sourceLabel}, 최종수정 {route.sourceUpdatedAt}
          </small>
        </div>
      </aside>
    </div>
  )
}
