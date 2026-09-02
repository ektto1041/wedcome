import { SectionTitle } from '../components/SectionTitle'
import { invitation } from '../data/invitation'

type IntroSectionProps = {
  showHosts?: boolean
}

export function IntroSection({ showHosts = false }: IntroSectionProps) {
  const paragraphs = invitation.message.split('\n\n')

  return (
    <section id="invitation" className="content-narrow section">
      <SectionTitle eyebrow="Invitation" title="함께해 주세요" />
      <div className="intro-message">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {showHosts ? (
        <div className="intro-hosts" aria-label="양가 혼주 안내">
          <p>
            <span className="intro-hosts__parents">
              {invitation.hosts.groomSide.parents.map((parent, index) => (
                <span key={parent}>
                  {index > 0 ? <span aria-hidden="true"> · </span> : null}
                  <strong>{parent}</strong>
                </span>
              ))}
            </span>
            <span className="intro-hosts__relation">
              의 {invitation.hosts.groomSide.relation}
            </span>
            <strong className="intro-hosts__couple">
              {invitation.couple.groom}
            </strong>
          </p>
          <p>
            <span className="intro-hosts__parents">
              {invitation.hosts.brideSide.parents.map((parent, index) => (
                <span key={parent}>
                  {index > 0 ? <span aria-hidden="true"> · </span> : null}
                  <strong>{parent}</strong>
                </span>
              ))}
            </span>
            <span className="intro-hosts__relation">
              의 {invitation.hosts.brideSide.relation}
            </span>
            <strong className="intro-hosts__couple">
              {invitation.couple.bride}
            </strong>
          </p>
        </div>
      ) : null}
    </section>
  )
}
