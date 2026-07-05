type NaverMapLatLng = {
  lat: () => number
  lng: () => number
}

type NaverMapConstructor = new (
  element: HTMLElement,
  options: {
    center: NaverMapLatLng
    zoom: number
    draggable?: boolean
    pinchZoom?: boolean
    scrollWheel?: boolean
    keyboardShortcuts?: boolean
  },
) => unknown

type NaverMarkerConstructor = new (options: {
  position: NaverMapLatLng
  map: unknown
  title?: string
}) => unknown

type NaverMapsNamespace = {
  LatLng: new (lat: number, lng: number) => NaverMapLatLng
  Map: NaverMapConstructor
  Marker: NaverMarkerConstructor
}

declare global {
  interface Window {
    naver?: {
      maps?: NaverMapsNamespace
    }
  }
}

export {}
