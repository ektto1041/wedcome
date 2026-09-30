import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import {
  getDownloadURL,
  ref,
  type UploadTaskSnapshot,
  uploadBytesResumable,
} from 'firebase/storage'
import { guestStoryConfig } from '../data/guestStoryConfig'
import { db } from '../lib/firebase'
import { ensureAnonymousUser } from '../lib/firebaseAuth'
import { firebaseStorage } from '../lib/firebaseStorage'
import type {
  GuestStoryDocument,
  GuestStoryRecord,
  PreparedGuestMedia,
} from '../types/guestStory'

type UploadGuestMediaCallbacks = {
  onProgress: (progress: number) => void
  onSaving: () => void
}

type UploadGuestMediaResult = {
  revision: string
  uploaderId: string
}

function guestStoriesCollection(weddingId: string) {
  return collection(db, 'weddings', weddingId, 'guestStories')
}

function guestStoryReference(weddingId: string, uploaderId: string) {
  return doc(db, 'weddings', weddingId, 'guestStories', uploaderId)
}

export function subscribeGuestStories(
  weddingId: string,
  onChange: (stories: GuestStoryRecord[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const storiesQuery = query(
    guestStoriesCollection(weddingId),
    orderBy('createdAt', 'asc'),
    limit(guestStoryConfig.storyQueryLimit),
  )

  return onSnapshot(
    storiesQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((snapshotDocument) => ({
          id: snapshotDocument.id,
          ...(snapshotDocument.data() as GuestStoryDocument),
        })),
      )
    },
    (error) => onError(error),
  )
}

export async function getMyGuestStory(
  weddingId: string,
  uploaderId: string,
): Promise<GuestStoryDocument | null> {
  const snapshot = await getDoc(guestStoryReference(weddingId, uploaderId))
  return snapshot.exists() ? (snapshot.data() as GuestStoryDocument) : null
}

export async function uploadGuestMedia(
  weddingId: string,
  media: PreparedGuestMedia,
  callbacks: UploadGuestMediaCallbacks,
): Promise<UploadGuestMediaResult> {
  const user = await ensureAnonymousUser()
  const storagePath = `weddings/${weddingId}/guest-stories/${user.uid}/media`
  const existingStory = await getMyGuestStory(weddingId, user.uid)
  const storageReference = ref(firebaseStorage, storagePath)

  const uploadSnapshot = await new Promise<UploadTaskSnapshot>(
    (resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageReference, media.blob, {
        contentType: media.contentType,
        customMetadata: { uploaderId: user.uid },
      })

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            snapshot.totalBytes > 0
              ? snapshot.bytesTransferred / snapshot.totalBytes
              : 0
          callbacks.onProgress(progress)
        },
        reject,
        () => resolve(uploadTask.snapshot),
      )
    },
  )

  callbacks.onSaving()
  const revision = uploadSnapshot.metadata.generation
  const downloadUrl = await getDownloadURL(uploadSnapshot.ref)

  await setDoc(guestStoryReference(weddingId, user.uid), {
    uploaderId: user.uid,
    mediaType: media.mediaType,
    contentType: media.contentType,
    storagePath,
    downloadUrl,
    byteSize: media.blob.size,
    width: media.width,
    height: media.height,
    durationMs: media.durationMs,
    revision,
    createdAt: existingStory?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return { revision, uploaderId: user.uid }
}
