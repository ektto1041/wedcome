import { getAnalytics, isSupported } from 'firebase/analytics'
import { firebaseApp } from './firebaseApp'

export async function initializeFirebaseAnalytics() {
  if (!import.meta.env.PROD || !(await isSupported())) {
    return
  }

  getAnalytics(firebaseApp)
}
