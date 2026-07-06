import { ExpandableGallery } from '../components/ExpandableGallery'
import { SectionTitle } from '../components/SectionTitle'
import { invitation } from '../data/invitation'

export function GallerySection() {
  return (
    <section className="section">
      <SectionTitle
        eyebrow="Gallery"
        title="우리의 장면"
        description="오래 바라보고 싶은 순간들을 천천히 담았습니다."
      />
      <ExpandableGallery images={invitation.gallery} />
    </section>
  )
}
