import { SectionTitle } from '../components/SectionTitle'
import { invitation } from '../data/invitation'

export function ContactSection() {
  return (
    <section className="content-narrow section">
      <SectionTitle
        eyebrow="Contact"
        title="연락하기"
        description="모바일에서 바로 연결되도록 큰 터치 영역의 링크를 기본값으로 둡니다."
      />
      <div className="contact-actions">
        {invitation.contacts.map((contact) => (
          <a key={contact.label} className="action-button" href={contact.href}>
            {contact.label}
          </a>
        ))}
      </div>
    </section>
  )
}
