type GuestMediaControlsProps = {
  canShowGuestStories: boolean
  hasExistingMedia: boolean
  onOpenUpload: () => void
  onToggleStorySource: () => void
  storySource: 'guest' | 'original'
}

export function GuestMediaControls({
  canShowGuestStories,
  hasExistingMedia,
  onOpenUpload,
  onToggleStorySource,
  storySource,
}: GuestMediaControlsProps) {
  return (
    <div className="guest-media-controls">
      <button
        className="guest-media-controls__button guest-media-controls__button--primary"
        onClick={onOpenUpload}
        type="button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 7.5h3l1.4-2h6.2l1.4 2h3A1.5 1.5 0 0 1 21 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V9a1.5 1.5 0 0 1 1.5-1.5Z" />
          <circle cx="12" cy="13" r="3.2" />
        </svg>
        {hasExistingMedia ? '내 인생샷 바꾸기' : '인생샷 추가하기'}
      </button>
      {canShowGuestStories ? (
        <button
          className="guest-media-controls__button"
          onClick={onToggleStorySource}
          type="button"
        >
          {storySource === 'guest' ? '우리 이야기 보기' : '하객 인생샷 보기'}
        </button>
      ) : null}
    </div>
  )
}
