import { getAuth, signInAnonymously, type User } from 'firebase/auth'
import { firebaseApp } from './firebaseApp'

export const firebaseAuth = getAuth(firebaseApp)

let pendingAnonymousSignIn: Promise<User> | null = null

export async function ensureAnonymousUser(): Promise<User> {
  if (firebaseAuth.currentUser) {
    return firebaseAuth.currentUser
  }

  if (!pendingAnonymousSignIn) {
    pendingAnonymousSignIn = signInAnonymously(firebaseAuth)
      .then((credential) => credential.user)
      .finally(() => {
        pendingAnonymousSignIn = null
      })
  }

  return pendingAnonymousSignIn
}
