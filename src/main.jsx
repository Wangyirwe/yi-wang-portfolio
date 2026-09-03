import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LangProvider } from './i18n.jsx'
import './index.css'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

window.addEventListener('pageshow', () => {
  const nav = performance.getEntriesByType?.('navigation')?.[0]
  if (nav?.type === 'reload') window.scrollTo(0, 0)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <App />
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
)
