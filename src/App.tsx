import { ChapterNavigation } from './components/ChapterNavigation'
import { HeroImageSection, HeroSection } from './sections/HeroSection'
import { IntroSection } from './sections/IntroSection'
import { MoneyGiftSection } from './sections/MoneyGiftSection'
import { ParkingSection } from './sections/ParkingSection'
import { WeddingInfoSection } from './sections/WeddingInfoSection'

export type InvitationVersion = 'default' | 'v2'

type AppProps = {
  version: InvitationVersion
}

function App({ version }: AppProps) {
  const isV2 = version === 'v2'

  return (
    <main className={`page ${isV2 ? 'page--v2' : ''}`}>
      <div className="container invitation-shell">
        {isV2 ? <HeroImageSection /> : <HeroSection />}
        <IntroSection />
        <WeddingInfoSection />
        <ParkingSection />
        <MoneyGiftSection />
      </div>
      <ChapterNavigation />
    </main>
  )
}

export default App
