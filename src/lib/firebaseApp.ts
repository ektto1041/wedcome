import { getApp, getApps, initializeApp } from 'firebase/app'

function getRequiredEnv(name: keyof ImportMetaEnv) {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${name}`)
  }

  return value
}

const firebaseConfig = {
  apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getRequiredEnv('VITE_FIREBASE_MEASUREMENT_ID'),
}

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig)
