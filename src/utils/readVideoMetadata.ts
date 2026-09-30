import { guestStoryConfig } from '../data/guestStoryConfig'

export type VideoMetadata = {
  durationMs: number
  width: number
  height: number
}

const VIDEO_METADATA_TIMEOUT_MS = 15_000

export async function readVideoMetadata(file: File): Promise<VideoMetadata> {
  if (file.type !== 'video/mp4') {
    throw new Error('MP4 형식의 영상만 올릴 수 있습니다.')
  }

  if (file.size > guestStoryConfig.videoMaxBytes) {
    throw new Error('영상 용량은 20MB 이하여야 합니다.')
  }

  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.playsInline = true

  try {
    return await new Promise<VideoMetadata>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        reject(new Error('영상 정보를 읽는 데 시간이 너무 오래 걸립니다.'))
      }, VIDEO_METADATA_TIMEOUT_MS)

      const finish = (callback: () => void) => {
        window.clearTimeout(timeoutId)
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('error', handleError)
        callback()
      }

      const handleLoadedMetadata = () => {
        const durationMs = Math.ceil(video.duration * 1000)

        if (
          !Number.isFinite(durationMs) ||
          durationMs <= 0 ||
          video.videoWidth <= 0 ||
          video.videoHeight <= 0
        ) {
          finish(() =>
            reject(new Error('영상 정보를 읽을 수 없는 MP4 파일입니다.')),
          )
          return
        }

        if (durationMs > guestStoryConfig.videoMaxDurationMs) {
          finish(() => reject(new Error('영상 길이는 10초 이하여야 합니다.')))
          return
        }

        finish(() =>
          resolve({
            durationMs,
            width: video.videoWidth,
            height: video.videoHeight,
          }),
        )
      }

      const handleError = () => {
        finish(() =>
          reject(
            new Error(
              '이 영상은 브라우저에서 재생할 수 없습니다. H.264 MP4 영상을 선택해 주세요.',
            ),
          ),
        )
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('error', handleError)
      video.src = objectUrl
    })
  } finally {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(objectUrl)
  }
}
