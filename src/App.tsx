import { useChapterSwipeNavigation } from './hooks/useChapterSwipeNavigation'
import { DesignSamplesSection } from './sections/DesignSamplesSection'
import { GallerySection } from './sections/GallerySection'
import { HeroSection } from './sections/HeroSection'
import { IntroSection } from './sections/IntroSection'
import { MoneyGiftSection } from './sections/MoneyGiftSection'
import { WeddingInfoSection } from './sections/WeddingInfoSection'

function App() {
  useChapterSwipeNavigation()

  return (
    <main className="page">
      <div className="container invitation-shell">
        <HeroSection />
        <IntroSection />
        <WeddingInfoSection />
        <GallerySection />
        <MoneyGiftSection />
        <DesignSamplesSection />
      </div>
    </main>
  )
}

export default App
