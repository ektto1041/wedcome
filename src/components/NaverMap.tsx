import { useEffect, useRef, useState } from 'react'
import { loadNaverMapScript } from '../utils/loadNaverMapScript'

type NaverMapProps = {
  venueName: string
  coordinates: {
    lat: number
    lng: number
  }
  mapUrl: string
}

type MapStatus = 'idle' | 'loading' | 'ready' | 'error' | 'missing-key'

export function NaverMap({ venueName, coordinates, mapUrl }: NaverMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<MapStatus>('idle')

  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID

    if (!clientId) {
      setStatus('missing-key')
      return
    }

    let isMounted = true
    setStatus('loading')

    loadNaverMapScript(clientId)
      .then((maps) => {
        if (!isMounted || !mapElementRef.current) {
          return
        }

        const position = new maps.LatLng(coordinates.lat, coordinates.lng)
        const map = new maps.Map(mapElementRef.current, {
          center: position,
          zoom: 14,
          draggable: false,
          pinchZoom: false,
          scrollWheel: false,
          keyboardShortcuts: false,
          disableDoubleTapZoom: true,
          disableDoubleClickZoom: true,
          disableTwoFingerTapZoom: true,
        })

        new maps.Marker({
          position,
          map,
          title: venueName,
        })

        setStatus('ready')
      })
      .catch(() => {
        if (isMounted) {
          setStatus('error')
        }
      })

    return () => {
      isMounted = false
    }
  }, [coordinates.lat, coordinates.lng, venueName])

  const showFallback = status === 'missing-key' || status === 'error'

  return (
    <div className="map-panel">
      <a
        className="map-panel__map-link"
        href={mapUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${venueName} 네이버 지도에서 보기`}
      >
        <span className="visually-hidden">
          {venueName} 네이버 지도에서 보기
        </span>
        <div ref={mapElementRef} className="naver-map" aria-hidden="true">
          {status === 'loading' ? (
            <p className="map-panel__status">지도를 불러오는 중입니다.</p>
          ) : null}
          {showFallback ? (
            <p className="map-panel__status">
              지도를 불러오지 못했습니다. 눌러서 위치를 확인해 주세요.
            </p>
          ) : null}
        </div>
      </a>
    </div>
  )
}
