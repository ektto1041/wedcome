import { useEffect, useRef, useState } from 'react'
import loverThemeMusic from './assets/audio/lover-theme.mp3'
import { ChapterNavigation } from './components/ChapterNavigation'
import { ThemeSplash } from './components/ThemeSplash'
import { HeroImageSection, HeroSection } from './sections/HeroSection'
import { IntroSection } from './sections/IntroSection'
import { MoneyGiftSection } from './sections/MoneyGiftSection'
import { ParkingSection } from './sections/ParkingSection'
import { WeddingInfoSection } from './sections/WeddingInfoSection'

export type InvitationVersion = 'default' | 'v2'

type AppProps = {
  version: InvitationVersion
}

const MUSIC_CONTROL_STICK_DISTANCE_PX = 40

function App({ version }: AppProps) {
  const isV2 = version === 'v2'
  const [isSplashVisible, setIsSplashVisible] = useState(true)
  const [hasOpenedInvitation, setHasOpenedInvitation] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const musicRef = useRef<HTMLAudioElement>(null)
  const musicControlRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let frameId: number | null = null

    const updateMusicControlPosition = () => {
      const control = musicControlRef.current
      if (control) {
        const scrollShift = Math.min(
          Math.max(window.scrollY, 0),
          MUSIC_CONTROL_STICK_DISTANCE_PX,
        )
        const heroOffset = MUSIC_CONTROL_STICK_DISTANCE_PX - scrollShift

        control.style.setProperty(
          '--music-control-hero-offset',
          `${heroOffset}px`,
        )
        control.classList.toggle('is-stuck', heroOffset === 0)
      }
      frameId = null
    }

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateMusicControlPosition)
      }
    }

    updateMusicControlPosition()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  const toggleMusic = () => {
    if (!musicRef.current) {
      return
    }

    if (musicRef.current.paused) {
      musicRef.current.volume = 0.4
      void musicRef.current.play()
      return
    }

    musicRef.current.pause()
  }

  return (
    <>
      {isSplashVisible ? (
        <ThemeSplash
          onComplete={() => setIsSplashVisible(false)}
          onOpen={() => setHasOpenedInvitation(true)}
        />
      ) : null}
      <main className={`page ${isV2 ? 'page--v2' : ''}`}>
        <div className="container invitation-shell">
          {isV2 ? (
            <HeroImageSection />
          ) : (
            <HeroSection isPlaybackEnabled={hasOpenedInvitation} />
          )}
          <IntroSection />
          <WeddingInfoSection />
          <ParkingSection />
          <MoneyGiftSection />
        </div>
        <ChapterNavigation />
      </main>
      {/* biome-ignore lint/a11y/useMediaCaption: 배경 연주곡에는 자막으로 옮길 음성이 없습니다. */}
      <audio
        loop
        onPause={() => setIsMusicPlaying(false)}
        onPlay={() => setIsMusicPlaying(true)}
        preload="none"
        ref={musicRef}
        src={loverThemeMusic}
      />
      <button
        aria-label={isMusicPlaying ? '음악 끄기' : '음악 켜기'}
        className="music-control"
        onClick={toggleMusic}
        ref={musicControlRef}
        type="button"
      >
        {isMusicPlaying ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3.2L11 6.4v11.2l-3.8-3.1H4v-5Z" />
            <path d="M14.4 9.1a4.1 4.1 0 0 1 0 5.8M17 6.7a7.4 7.4 0 0 1 0 10.6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3.2L11 6.4v11.2l-3.8-3.1H4v-5Z" />
            <path d="m14.5 9.5 5 5m0-5-5 5" />
          </svg>
        )}
      </button>
    </>
  )
}

export default App
