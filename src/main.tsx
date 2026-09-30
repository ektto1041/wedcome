import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App, { type InvitationVersion } from './App.tsx'
import './styles/global.css'

function getInvitationVersion(search: string): InvitationVersion {
  const version = new URLSearchParams(search).get('version')

  return version === 'v2' ? 'v2' : 'default'
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const version = getInvitationVersion(window.location.search)
document.documentElement.dataset.invitationVersion = version

createRoot(rootElement).render(
  <StrictMode>
    <App version={version} />
  </StrictMode>,
)

if (import.meta.env.PROD && version === 'v2') {
  window.setTimeout(() => {
    void import('./lib/firebaseAnalytics')
      .then(({ initializeFirebaseAnalytics }) => initializeFirebaseAnalytics())
      .catch(() => undefined)
  }, 0)
}
