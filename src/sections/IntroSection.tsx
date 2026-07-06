import { SectionTitle } from '../components/SectionTitle'
import { invitation } from '../data/invitation'

export function IntroSection() {
  const paragraphs = invitation.message.split('\n\n')

  return (
    <section className="content-narrow section">
      <SectionTitle eyebrow="Invitation" title="함께해 주세요" />
      <div className="intro-message" aria-label="청첩장 인사말">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}
