export type NaverMapLatLng = {
  lat: () => number
  lng: () => number
}

export type NaverMapConstructor = new (
  element: HTMLElement,
  options: {
    center: NaverMapLatLng
    zoom: number
    draggable?: boolean
    pinchZoom?: boolean
    scrollWheel?: boolean
    keyboardShortcuts?: boolean
    disableDoubleTapZoom?: boolean
    disableDoubleClickZoom?: boolean
    disableTwoFingerTapZoom?: boolean
  },
) => unknown

export type NaverMarkerConstructor = new (options: {
  position: NaverMapLatLng
  map: unknown
  title?: string
}) => unknown

export type NaverMapsNamespace = {
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
