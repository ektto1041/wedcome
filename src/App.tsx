import { ContactSection } from './sections/ContactSection'
import { DesignSamplesSection } from './sections/DesignSamplesSection'
import { GallerySection } from './sections/GallerySection'
import { HeroSection } from './sections/HeroSection'
import { IntroSection } from './sections/IntroSection'
import { WeddingInfoSection } from './sections/WeddingInfoSection'

function App() {
  return (
    <main className="page">
      <div className="container invitation-shell">
        <HeroSection />
        <IntroSection />
        <WeddingInfoSection />
        <GallerySection />
        <ContactSection />
        <DesignSamplesSection />
      </div>
    </main>
  )
}

export default App
