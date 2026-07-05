import { SectionTitle } from '../components/SectionTitle'
import { invitation } from '../data/invitation'

export function IntroSection() {
  return (
    <section className="content-narrow section">
      <SectionTitle
        eyebrow="Invitation"
        title="함께해 주세요"
        description={invitation.message}
      />
    </section>
  )
}
