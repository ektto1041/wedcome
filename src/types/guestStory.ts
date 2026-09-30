import type { Timestamp } from 'firebase/firestore'

export type GuestMediaType = 'image' | 'video'
export type GuestMediaContentType = 'image/webp' | 'image/jpeg' | 'video/mp4'

export type GuestStoryDocument = {
  uploaderId: string
  mediaType: GuestMediaType
  contentType: GuestMediaContentType
  storagePath: string
  downloadUrl: string
  byteSize: number
  width: number
  height: number
  durationMs: number | null
  revision: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type GuestStoryRecord = GuestStoryDocument & {
  id: string
}

export type PreparedGuestMedia = {
  blob: Blob
  contentType: GuestMediaContentType
  mediaType: GuestMediaType
  width: number
  height: number
  durationMs: number | null
}
