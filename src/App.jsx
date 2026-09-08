import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Cursor from './components/Cursor.jsx'
import SylvaDock from './components/SylvaDock.jsx'
import WebGLBackground from './components/WebGLBackground.jsx'
import { useLang } from './i18n.jsx'
import Film from './pages/Film.jsx'
import Home from './pages/Home.jsx'
import Work from './pages/Work.jsx'

export default function App() {
  const { t } = useLang()
  const { pathname } = useLocation()
  const cinema = pathname.startsWith('/film')
  const home = pathname === '/'
  const [heroReady, setHeroReady] = useState(!home)

  useEffect(() => {
    if (!home || heroReady) return undefined
    const show = () => setHeroReady(true)
    const onMsg = (event) => {
      if (event.data?.type === 'yw-sylva-scene' || event.data?.type === 'yw-sylva-quiet') show()
    }
    window.addEventListener('message', onMsg)
    const timer = window.setTimeout(show, 2400)
    return () => {
      window.removeEventListener('message', onMsg)
      window.clearTimeout(timer)
    }
  }, [home, heroReady])

  return (
    <div className={`app-shell ${cinema ? 'is-cinema' : ''} ${home ? 'is-home' : ''}`}>
      {heroReady ? <Cursor /> : null}
      {!cinema && !home && <WebGLBackground />}
      {!cinema && <div className="grain" aria-hidden="true" />}
      {!cinema && heroReady ? <SylvaDock /> : null}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<Work />} />
        <Route path="/film/time-snack-inn" element={<Film />} />
      </Routes>
      {!cinema && (
        <footer className="site-footer">
          <span>YI WANG 2026©</span>
          <span>{t('footer')}</span>
        </footer>
      )}
    </div>
  )
}
