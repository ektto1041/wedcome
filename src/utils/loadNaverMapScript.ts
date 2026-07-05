import type { NaverMapsNamespace } from '../types/naver-maps'

let naverMapScriptPromise: Promise<NaverMapsNamespace> | null = null

export function loadNaverMapScript(clientId: string) {
  if (window.naver?.maps) {
    return Promise.resolve(window.naver.maps)
  }

  if (naverMapScriptPromise) {
    return naverMapScriptPromise
  }

  naverMapScriptPromise = new Promise<NaverMapsNamespace>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-naver-map-sdk="true"]',
    )

    const handleLoad = () => {
      if (window.naver?.maps) {
        resolve(window.naver.maps)
        return
      }

      reject(new Error('Naver Maps SDK loaded without maps namespace'))
    }

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load Naver Maps SDK')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`
    script.async = true
    script.defer = true
    script.dataset.naverMapSdk = 'true'
    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('Failed to load Naver Maps SDK')),
      { once: true },
    )

    document.head.appendChild(script)
  })

  return naverMapScriptPromise
}
