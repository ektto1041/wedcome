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
          draggable: true,
          pinchZoom: true,
          scrollWheel: false,
          keyboardShortcuts: true,
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
      <div
        ref={mapElementRef}
        className="naver-map"
        role="img"
        aria-label={`${venueName} 위치 지도`}
      >
        {status === 'loading' ? (
          <p className="map-panel__status">지도를 불러오는 중입니다.</p>
        ) : null}
        {showFallback ? (
          <p className="map-panel__status">
            지도를 표시하지 못했습니다. 아래 링크로 위치를 확인해 주세요.
          </p>
        ) : null}
      </div>
      <a
        className="map-panel__link"
        href={mapUrl}
        target="_blank"
        rel="noreferrer"
      >
        네이버지도에서 보기
      </a>
    </div>
  )
}
