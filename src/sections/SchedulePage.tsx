import { invitation } from '../data/invitation'

type SchedulePageProps = {
  onBack: () => void
}

export function SchedulePage({ onBack }: SchedulePageProps) {
  return (
    <main className="schedule-page">
      <div className="schedule-page__container">
        <header className="schedule-page__header">
          <button
            aria-label="청첩장으로 돌아가기"
            className="schedule-page__back"
            onClick={onBack}
            type="button"
          >
            <span aria-hidden="true">←</span>
            청첩장으로
          </button>
          <p>Wedding Program</p>
          <h1>예식 식순</h1>
          <div className="schedule-page__wedding-info">
            <span>{invitation.wedding.dateLabel.replace('\n', ' · ')}</span>
            <span>{invitation.wedding.venueName}</span>
          </div>
        </header>

        <ol className="schedule-list">
          {invitation.schedule.map((item, index) => (
            <li key={item.id}>
              <span className="schedule-list__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="schedule-list__marker" aria-hidden="true" />
              <strong>{item.title}</strong>
            </li>
          ))}
        </ol>

        <footer className="schedule-page__footer">
          <p>예식 진행 상황에 따라 순서가 일부 변경될 수 있습니다.</p>
          <button type="button" onClick={onBack}>
            청첩장으로 돌아가기
          </button>
        </footer>
      </div>
    </main>
  )
}
