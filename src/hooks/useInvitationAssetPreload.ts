import { useCallback, useEffect, useState } from 'react'
import loverThemeMusic from '../assets/audio/lover-theme.mp3'
import brideProfileImage from '../assets/images/bride-profile.jpg'
import groomProfileImage from '../assets/images/groom-profile.jpg'
import heroImage from '../assets/images/hero-image.jpg'
import firstStoryImage from '../assets/images/hero-story-1.jpg'
import fifthStoryImage from '../assets/images/hero-story-5.jpg'
import seventhStoryImage from '../assets/images/hero-story-7.jpg'
import ninthStoryImage from '../assets/images/hero-story-9.jpg'
import paperTexture from '../assets/images/paper-texture.jpg'
import parkingMap from '../assets/images/parking-map-aerial-annotated.webp'
import splashImage from '../assets/images/wedding-card-splash-optimized.jpg'
import firstStoryVideo from '../assets/videos/video1.mp4'
import secondStoryVideo from '../assets/videos/video2.mp4'
import thirdStoryVideo from '../assets/videos/video3.mp4'
import fourthStoryVideo from '../assets/videos/video6.mp4'

export type InvitationAssetStatus = 'loading' | 'ready' | 'error'

const MINIMUM_LOADING_DURATION_MS = 500
const MAXIMUM_LOADING_DURATION_MS = 3000

const invitationAssetUrls = [
  splashImage,
  paperTexture,
  heroImage,
  brideProfileImage,
  groomProfileImage,
  firstStoryImage,
  fifthStoryImage,
  seventhStoryImage,
  ninthStoryImage,
  parkingMap,
  firstStoryVideo,
  secondStoryVideo,
  thirdStoryVideo,
  fourthStoryVideo,
  loverThemeMusic,
]

let invitationAssetLoadPromise: Promise<void> | null = null

async function downloadAsset(url: string) {
  const response = await fetch(url, { cache: 'force-cache' })

  if (!response.ok) {
    throw new Error(`Failed to preload asset: ${url}`)
  }

  await response.blob()
}

async function loadInvitationFonts() {
  if (!document.fonts) {
    return
  }

  await Promise.all([
    document.fonts.load('400 1rem "Yeongwol"'),
    document.fonts.load('400 1rem "GounBatang"'),
    document.fonts.load('700 1rem "GounBatang"'),
  ])
}

async function loadInvitationAssets() {
  const startedAt = performance.now()

  await Promise.race([
    Promise.all([
      ...invitationAssetUrls.map(downloadAsset),
      loadInvitationFonts(),
    ]),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, MAXIMUM_LOADING_DURATION_MS)
    }),
  ])

  const remainingDelay = Math.max(
    0,
    MINIMUM_LOADING_DURATION_MS - (performance.now() - startedAt),
  )

  if (remainingDelay > 0) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, remainingDelay)
    })
  }
}

function getInvitationAssetLoadPromise() {
  invitationAssetLoadPromise ??= loadInvitationAssets()
  return invitationAssetLoadPromise
}

export function useInvitationAssetPreload() {
  const [status, setStatus] = useState<InvitationAssetStatus>('loading')
  const [loadAttempt, setLoadAttempt] = useState(() =>
    getInvitationAssetLoadPromise(),
  )

  useEffect(() => {
    let isCurrentAttempt = true

    void loadAttempt
      .then(() => {
        if (isCurrentAttempt) {
          setStatus('ready')
        }
      })
      .catch(() => {
        if (isCurrentAttempt) {
          setStatus('error')
        }
      })

    return () => {
      isCurrentAttempt = false
    }
  }, [loadAttempt])

  const retry = useCallback(() => {
    invitationAssetLoadPromise = null
    setStatus('loading')
    setLoadAttempt(getInvitationAssetLoadPromise())
  }, [])

  return { retry, status }
}
