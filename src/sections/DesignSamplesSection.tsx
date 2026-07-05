const samples = [
  {
    id: 'paper',
    title: 'Soft Paper Layer',
    description:
      '테두리 대신 종이 질감, 낮은 그림자, 여백으로 정보를 구분합니다.',
    meta: ['예식 안내', '가장 추천'],
  },
  {
    id: 'glass',
    title: 'Glassmorphism Lite',
    description:
      '반투명 레이어와 블러를 써서 지도와 Drawer 같은 기능 UI에 잘 맞습니다.',
    meta: ['지도', 'Drawer'],
  },
  {
    id: 'editorial',
    title: 'Editorial Minimal',
    description:
      '카드보다 타이포그래피와 간격으로 읽는 흐름을 만드는 방식입니다.',
    meta: ['인사말', '본문'],
  },
  {
    id: 'soft-ui',
    title: 'Soft UI',
    description: '약한 입체감으로 버튼과 작은 액션을 부드럽게 강조합니다.',
    meta: ['버튼', '계좌'],
  },
]

export function DesignSamplesSection() {
  return (
    <section
      className="section design-samples"
      aria-labelledby="design-samples-title"
    >
      <header className="section-title">
        <p className="section-title__eyebrow">Design Direction</p>
        <h2 id="design-samples-title" className="section-title__heading">
          테두리 없는 디자인 시안
        </h2>
        <p className="section-title__description">
          각 샘플은 같은 정보를 다른 표면감으로 보여주는 비교용입니다.
        </p>
      </header>

      <div className="design-sample-list">
        {samples.map((sample) => (
          <article
            className={`design-sample design-sample--${sample.id}`}
            key={sample.id}
          >
            <div className="design-sample__header">
              <p>{sample.title}</p>
              <span>{sample.meta.join(' / ')}</span>
            </div>
            <div className="design-sample__preview">
              <p className="design-sample__date">2026.10.03 SAT 4:30 PM</p>
              <h3>전통리조트 구름에</h3>
              <p>{sample.description}</p>
              <button type="button">자세히 보기</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
