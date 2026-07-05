import { SectionTitle } from '../components/SectionTitle'
import { invitation } from '../data/invitation'

export function GallerySection() {
  return (
    <section className="section">
      <SectionTitle
        eyebrow="Gallery"
        title="우리의 장면"
        description="이미지 최적화가 준비되면 실제 사진으로 자연스럽게 교체할 수 있는 자리입니다."
      />
      <div className="gallery-grid">
        {invitation.gallery.map((item) => (
          <article key={item} className="gallery-card" aria-label={item}>
            <span>{item}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
