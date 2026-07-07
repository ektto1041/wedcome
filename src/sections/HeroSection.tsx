import heroImage from '../assets/images/hero-image.jpg'
import { invitation } from '../data/invitation'

export function HeroSection() {
  return (
    <section className="hero-section">
      <img
        className="hero-section__image"
        src={heroImage}
        width="1800"
        height="1350"
        alt={`${invitation.couple.groom}과 ${invitation.couple.bride}의 웨딩 이미지`}
      />
      <div className="hero-section__content">
        <h1 className="hero-section__title">
          {invitation.couple.bride}과 {invitation.couple.groom}
        </h1>
      </div>
    </section>
  )
}
