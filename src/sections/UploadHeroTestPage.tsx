import { GuestHeroExperience } from './GuestHeroExperience'

export function UploadHeroTestPage() {
  return (
    <main className="page page--upload-test">
      <div className="container invitation-shell">
        <GuestHeroExperience isPlaybackEnabled mode="test" />
      </div>
    </main>
  )
}
