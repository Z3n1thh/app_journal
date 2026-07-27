import { Component } from 'react'
import ReactDOM from 'react-dom/client'
import { LanguageProvider } from './i18n/LanguageContext'
import App from './App'
import './index.css'

class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '40rem', margin: '2rem auto' }}>
          <h1>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fee', padding: '1rem', borderRadius: '8px' }}>
            {this.state.error.message}
          </pre>
          <button type="button" onClick={() => window.location.reload()}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

async function clearDevServiceWorkers() {
  if (!import.meta.env.DEV) return
  if (!('serviceWorker' in navigator)) return
  const regs = await navigator.serviceWorker.getRegistrations()
  if (!regs.length) return
  await Promise.all(regs.map((r) => r.unregister()))
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  }
  if (!sessionStorage.getItem('bujo-sw-cleared')) {
    sessionStorage.setItem('bujo-sw-cleared', '1')
    window.location.reload()
  }
}

async function boot() {
  await clearDevServiceWorkers()

  const root = document.getElementById('root')
  if (!root) return

  ReactDOM.createRoot(root).render(
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>,
  )
}

boot()

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}
