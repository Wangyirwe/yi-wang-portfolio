import { Route, Routes, useLocation } from 'react-router-dom'
import Cursor from './components/Cursor.jsx'
import Nav from './components/Nav.jsx'
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

  return (
    <div className={`app-shell ${cinema ? 'is-cinema' : ''} ${home ? 'is-home' : ''}`}>
      <Cursor />
      {!cinema && !home && <WebGLBackground />}
      {!cinema && <div className="grain" aria-hidden="true" />}
      {!cinema && <Nav />}
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
