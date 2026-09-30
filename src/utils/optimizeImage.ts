import { guestStoryConfig } from '../data/guestStoryConfig'

export type OptimizedImage = {
  blob: Blob
  contentType: 'image/webp' | 'image/jpeg'
  width: number
  height: number
}

type DecodedImage = {
  source: CanvasImageSource
  width: number
  height: number
  close: () => void
}

const QUALITY_STEPS = [0.82, 0.74, 0.66, 0.58, 0.5] as const
const RESOLUTION_STEPS = [1, 0.85, 0.7, 0.55] as const

async function decodeWithImageElement(file: File): Promise<DecodedImage> {
  const objectUrl = URL.createObjectURL(file)
  const image = new Image()
  image.decoding = 'async'

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () =>
        reject(
          new Error(
            '이미지를 읽을 수 없습니다. 손상된 파일이거나 이 브라우저에서 지원하지 않는 HEIC일 수 있습니다.',
          ),
        )
      image.src = objectUrl
    })

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(objectUrl),
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: 'from-image',
      })
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      }
    } catch {
      // Safari의 일부 HEIC/JPEG는 Image 요소에서만 디코딩될 수 있다.
    }
  }

  return decodeWithImageElement(file)
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  contentType: 'image/webp' | 'image/jpeg',
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), contentType, quality)
  })
}

function getScaledSize(
  sourceWidth: number,
  sourceHeight: number,
  resolutionScale: number,
) {
  const longEdge = Math.max(sourceWidth, sourceHeight)
  const baseScale = Math.min(1, guestStoryConfig.imageMaxLongEdge / longEdge)
  const scale = baseScale * resolutionScale

  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  }
}

async function encodeAtSize(
  decoded: DecodedImage,
  width: number,
  height: number,
  contentType: 'image/webp' | 'image/jpeg',
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', {
    alpha: contentType === 'image/webp',
  })

  if (!context) {
    throw new Error('이미지 처리 기능을 사용할 수 없는 브라우저입니다.')
  }

  if (contentType === 'image/jpeg') {
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
  }
  context.drawImage(decoded.source, 0, 0, width, height)

  let smallestBlob: Blob | null = null
  for (const quality of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, contentType, quality)
    if (!blob || blob.type !== contentType) {
      return null
    }

    smallestBlob = blob
    if (blob.size <= guestStoryConfig.imageTargetBytes) {
      canvas.width = 0
      canvas.height = 0
      return blob
    }
  }

  canvas.width = 0
  canvas.height = 0
  return smallestBlob
}

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일 또는 MP4 영상을 선택해 주세요.')
  }

  const decoded = await decodeImage(file)

  try {
    if (decoded.width <= 0 || decoded.height <= 0) {
      throw new Error('이미지의 크기 정보를 읽을 수 없습니다.')
    }

    for (const contentType of ['image/webp', 'image/jpeg'] as const) {
      for (const resolutionScale of RESOLUTION_STEPS) {
        const { width, height } = getScaledSize(
          decoded.width,
          decoded.height,
          resolutionScale,
        )
        const blob = await encodeAtSize(decoded, width, height, contentType)

        if (!blob) {
          break
        }

        if (blob.size <= guestStoryConfig.imageMaxOutputBytes) {
          return { blob, contentType, width, height }
        }
      }
    }

    throw new Error(
      '이미지를 5MB 이하로 최적화하지 못했습니다. 다른 이미지를 선택해 주세요.',
    )
  } finally {
    decoded.close()
  }
}
