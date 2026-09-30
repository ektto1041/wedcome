import { FirebaseError } from 'firebase/app'
import { onAuthStateChanged } from 'firebase/auth'
import { useCallback, useEffect, useRef, useState } from 'react'
import { firebaseAuth } from '../lib/firebaseAuth'
import { getMyGuestStory, uploadGuestMedia } from '../services/guestStories'
import type { GuestMediaType, PreparedGuestMedia } from '../types/guestStory'
import { optimizeImage } from '../utils/optimizeImage'
import { readVideoMetadata } from '../utils/readVideoMetadata'

export type UploadStatus =
  | 'idle'
  | 'validating'
  | 'compressing'
  | 'uploading'
  | 'saving'
  | 'success'
  | 'error'

const BUSY_STATUSES: ReadonlySet<UploadStatus> = new Set([
  'validating',
  'compressing',
  'uploading',
  'saving',
])

export function isUploadBusy(status: UploadStatus) {
  return BUSY_STATUSES.has(status)
}

function getUploadErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error
      ? error.message
      : '업로드 중 알 수 없는 오류가 발생했습니다.'
  }

  if (error.code === 'auth/operation-not-allowed') {
    return 'Firebase Console에서 익명 로그인을 활성화해야 합니다.'
  }

  if (
    error.code === 'auth/network-request-failed' ||
    error.code === 'storage/retry-limit-exceeded' ||
    error.code === 'unavailable'
  ) {
    return '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
  }

  if (
    error.code === 'storage/unauthorized' ||
    error.code === 'permission-denied'
  ) {
    return '업로드 권한을 확인할 수 없습니다. Firebase 보안 규칙을 확인해 주세요.'
  }

  if (error.code === 'storage/quota-exceeded') {
    return '저장 공간 사용 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
  }

  return 'Firebase에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

export function useGuestMediaUpload(weddingId: string) {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasExistingMedia, setHasExistingMedia] = useState(false)
  const [selectedMediaType, setSelectedMediaType] =
    useState<GuestMediaType | null>(null)
  const isRunningRef = useRef(false)
  const didUploadRef = useRef(false)
  const lastFileRef = useRef<File | null>(null)

  useEffect(() => {
    let isActive = true

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        if (isActive) {
          setHasExistingMedia(false)
        }
        return
      }

      void getMyGuestStory(weddingId, user.uid)
        .then((story) => {
          if (isActive && !didUploadRef.current) {
            setHasExistingMedia(story !== null)
          }
        })
        .catch(() => undefined)
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [weddingId])

  const selectAndUpload = useCallback(
    async (file: File) => {
      if (isRunningRef.current) {
        return
      }

      isRunningRef.current = true
      lastFileRef.current = file
      setProgress(0)
      setErrorMessage(null)
      setStatus('validating')

      try {
        let media: PreparedGuestMedia

        if (file.type.startsWith('image/')) {
          setSelectedMediaType('image')
          setStatus('compressing')
          const optimized = await optimizeImage(file)
          media = {
            ...optimized,
            mediaType: 'image',
            durationMs: null,
          }
        } else if (file.type === 'video/mp4') {
          setSelectedMediaType('video')
          const metadata = await readVideoMetadata(file)
          media = {
            blob: file,
            contentType: 'video/mp4',
            mediaType: 'video',
            ...metadata,
          }
        } else if (file.type.startsWith('video/')) {
          throw new Error('MP4 형식의 영상만 올릴 수 있습니다.')
        } else {
          throw new Error('이미지 파일 또는 MP4 영상을 선택해 주세요.')
        }

        setStatus('uploading')
        await uploadGuestMedia(weddingId, media, {
          onProgress: setProgress,
          onSaving: () => setStatus('saving'),
        })
        setProgress(1)
        didUploadRef.current = true
        setHasExistingMedia(true)
        setStatus('success')
      } catch (error) {
        setErrorMessage(getUploadErrorMessage(error))
        setStatus('error')
      } finally {
        isRunningRef.current = false
      }
    },
    [weddingId],
  )

  const retry = useCallback(() => {
    if (lastFileRef.current) {
      void selectAndUpload(lastFileRef.current)
    }
  }, [selectAndUpload])

  const reset = useCallback(() => {
    if (isRunningRef.current) {
      return
    }
    lastFileRef.current = null
    setStatus('idle')
    setProgress(0)
    setErrorMessage(null)
    setSelectedMediaType(null)
  }, [])

  return {
    status,
    progress,
    errorMessage,
    hasExistingMedia,
    selectedMediaType,
    isBusy: isUploadBusy(status),
    selectAndUpload,
    retry,
    reset,
  }
}
