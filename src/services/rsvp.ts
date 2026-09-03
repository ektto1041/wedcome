import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type RsvpInput = {
  attendance: 'attending' | 'not-attending'
  guestCount: number
  guestName: string
  message: string
  side: 'groom' | 'bride'
}

export async function submitRsvp(input: RsvpInput) {
  await addDoc(collection(db, 'rsvps'), {
    ...input,
    consentVersion: '2026-09-03',
    createdAt: serverTimestamp(),
  })
}
