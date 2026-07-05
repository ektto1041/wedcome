import heroImage from '../assets/images/hero-image.png'
import { invitation } from '../data/invitation'

export function HeroSection() {
  return (
    <section className="hero-section">
      <img
        className="hero-section__image"
        src={heroImage}
        width="1402"
        height="1122"
        alt={`${invitation.couple.groom}과 ${invitation.couple.bride}의 웨딩 이미지`}
      />
      <div className="hero-section__content">
        <p className="hero-section__kicker">Wedding Invitation</p>
        <h1 className="hero-section__title">
          {invitation.couple.groom} 그리고 {invitation.couple.bride}
        </h1>
        <p className="hero-section__date">{invitation.wedding.dateLabel}</p>
        <p className="hero-section__venue">{invitation.wedding.venueName}</p>
      </div>
    </section>
  )
}
