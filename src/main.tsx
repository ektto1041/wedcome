import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App, { type InvitationVersion } from './App.tsx'
import './styles/global.css'

function getInvitationVersion(pathname: string): InvitationVersion {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  return normalizedPath === '/v2' ? 'v2' : 'default'
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const version = getInvitationVersion(window.location.pathname)
document.documentElement.dataset.invitationVersion = version

createRoot(rootElement).render(
  <StrictMode>
    <App version={version} />
  </StrictMode>,
)
