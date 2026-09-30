import { type ChangeEvent, useId, useRef } from 'react'
import type { UploadStatus } from '../hooks/useGuestMediaUpload'
import { BottomSheet } from './BottomSheet'

type GuestMediaUploadSheetProps = {
  errorMessage: string | null
  isBusy: boolean
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
  onSelectFile: (file: File) => void
  progress: number
  status: UploadStatus
}

const STATUS_LABELS: Partial<Record<UploadStatus, string>> = {
  validating: '파일을 확인하고 있어요...',
  compressing: '이미지를 최적화하고 있어요...',
  uploading: '미디어를 업로드하고 있어요...',
  saving: '스토리에 추가하는 중...',
}

export function GuestMediaUploadSheet({
  errorMessage,
  isBusy,
  isOpen,
  onClose,
  onRetry,
  onSelectFile,
  progress,
  status,
}: GuestMediaUploadSheetProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) {
      onSelectFile(file)
    }
  }

  const openFilePicker = () => inputRef.current?.click()

  return (
    <BottomSheet
      className="guest-upload-sheet"
      contentClassName="guest-upload-sheet__content"
      eyebrow="Guest Story"
      isDismissible={!isBusy}
      isOpen={isOpen}
      onClose={onClose}
      title="하객 인생샷 올리기"
    >
      <div className="guest-upload-sheet__guide">
        <p>예식의 한 장면을 함께 나눠 주세요.</p>
        <ul>
          <li>화면에 잘 담기는 세로 이미지·영상을 권장해요.</li>
          <li>이미지는 업로드 전에 자동으로 최적화돼요.</li>
          <li>영상은 MP4, 10초·20MB 이하만 가능해요.</li>
          <li>영상은 소리 없이 원본 길이만큼 재생돼요.</li>
          <li>업로드가 끝나면 별도 승인 없이 바로 공개돼요.</li>
        </ul>
      </div>

      <input
        accept="image/*,video/mp4"
        aria-label="업로드할 이미지 또는 MP4 영상 선택"
        className="visually-hidden"
        disabled={isBusy}
        id={inputId}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      {isBusy ? (
        <div className="guest-upload-sheet__state" aria-live="polite">
          <span className="guest-upload-sheet__spinner" aria-hidden="true" />
          <strong>{STATUS_LABELS[status]}</strong>
          {status === 'uploading' ? (
            <div className="guest-upload-sheet__progress-wrap">
              <div
                aria-label="업로드 진행률"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round(progress * 100)}
                className="guest-upload-sheet__progress"
                role="progressbar"
              >
                <span style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          ) : null}
          <small>완료될 때까지 이 창을 닫지 말아 주세요.</small>
        </div>
      ) : null}

      {status === 'success' ? (
        <div className="guest-upload-sheet__result" role="status">
          <strong>인생샷이 추가되었습니다.</strong>
          <p>하객 스토리에 곧바로 반영됩니다.</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="guest-upload-sheet__result is-error" role="alert">
          <strong>미디어를 올리지 못했습니다.</strong>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {!isBusy ? (
        <div className="guest-upload-sheet__actions">
          {status === 'error' ? (
            <button
              className="guest-upload-sheet__secondary"
              onClick={onRetry}
              type="button"
            >
              다시 시도
            </button>
          ) : null}
          <button
            className="guest-upload-sheet__select"
            onClick={openFilePicker}
            type="button"
          >
            {status === 'success' ? '다른 미디어로 바꾸기' : '미디어 선택하기'}
          </button>
        </div>
      ) : null}
    </BottomSheet>
  )
}
