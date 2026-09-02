import { SectionTitle } from '../components/SectionTitle'
import { invitation } from '../data/invitation'

const KEEP_TOGETHER_PHRASES = [
  {
    source: '알아본\n까닭이겠지요.',
    text: '알아본 까닭이겠지요.',
  },
  {
    source: '함께하려고 합니다.',
    text: '함께하려고 합니다.',
  },
] as const

export function IntroSection() {
  const paragraphs = invitation.message.split('\n\n')

  return (
    <section id="invitation" className="content-narrow section">
      <SectionTitle eyebrow="Invitation" title="함께해 주세요" />
      <div className="intro-message">
        {paragraphs.map((paragraph) => {
          const keptPhrase = KEEP_TOGETHER_PHRASES.find(({ source }) =>
            paragraph.includes(source),
          )
          const [prefix, suffix] = keptPhrase
            ? paragraph.split(keptPhrase.source)
            : [paragraph]

          return (
            <p key={paragraph}>
              {keptPhrase && suffix !== undefined ? (
                <>
                  {prefix}
                  <span className="intro-message__keep-together">
                    {keptPhrase.text}
                  </span>
                  {suffix}
                </>
              ) : (
                paragraph
              )}
            </p>
          )
        })}
      </div>
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
            <span>의</span>
            <span className="intro-hosts__relation-kind">
              {invitation.hosts.groomSide.relation}
            </span>
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
            <span>의</span>
            <span className="intro-hosts__relation-kind">
              {invitation.hosts.brideSide.relation}
            </span>
          </span>
          <strong className="intro-hosts__couple">
            {invitation.couple.bride}
          </strong>
        </p>
      </div>
    </section>
  )
}
