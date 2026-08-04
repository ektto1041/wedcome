import { ChapterNavigation } from './components/ChapterNavigation'
import { HeroSection } from './sections/HeroSection'
import { IntroSection } from './sections/IntroSection'
import { MoneyGiftSection } from './sections/MoneyGiftSection'
import { WeddingInfoSection } from './sections/WeddingInfoSection'

function App() {
  return (
    <main className="page">
      <div className="container invitation-shell">
        <HeroSection />
        <IntroSection />
        <WeddingInfoSection />
        <MoneyGiftSection />
      </div>
      <ChapterNavigation />
    </main>
  )
}

export default App
