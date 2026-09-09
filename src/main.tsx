/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'

// @skip-protected: Do not remove. Required for React rendering.
// Register Service Worker for PWA Offline Support (in production and preview)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Auto check updates
        reg.update()
      })
      .catch((err) => {
        console.log('SW registration error:', err)
      })
  })
}

createRoot(document.getElementById('root')!).render(<App />)
