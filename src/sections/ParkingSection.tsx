import parkingMap from '../assets/images/parking-map-aerial-annotated.webp'
import { SectionTitle } from '../components/SectionTitle'

export function ParkingSection() {
  return (
    <section id="parking" className="section parking-section">
      <SectionTitle
        eyebrow="Parking"
        title="주차 안내"
        description="예식 장소는 천자문 광장입니다."
      />

      <figure className="parking-map">
        <img
          src={parkingMap}
          width="1087"
          height="1447"
          loading="lazy"
          decoding="async"
          alt="성곽 대형주차장에서 천자문 광장 예식장까지의 이동 경로와 이용 불가 주차장을 표시한 위성 안내도"
        />
        <figcaption>주차 및 예식장 이동 안내</figcaption>
      </figure>

      <div className="content-narrow parking-section__content">
        <div className="parking-summary">
          <article className="parking-summary__item">
            <p className="parking-summary__label">주차 장소</p>
            <strong>성곽 대형주차장</strong>
            <span>약 400대 주차 가능</span>
          </article>
          <article className="parking-summary__item parking-summary__item--warning">
            <p className="parking-summary__label">주차 불가</p>
            <strong>제2·제3주차장</strong>
            <span>396커피숍 주차장 포함</span>
          </article>
        </div>

        <div className="parking-notice" role="note">
          <p className="parking-notice__title">방문 전 꼭 확인해 주세요</p>
          <ul>
            <li>예식 당일에는 주차요원의 안내에 따라 이동해 주세요.</li>
            <li>
              동승객은 예식장 인근에서 먼저 내리고, 차량 대표 한 분이 성곽
              대형주차장에 주차한 뒤 오시면 됩니다.
            </li>
            <li>
              제2주차장과 제3주차장은 예식 당일 이용할 수 없습니다.
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
