import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../i18n.jsx'

export default function Nav() {
  const { lang, toggle } = useLang()
  const { pathname } = useLocation()
  const home = pathname === '/'
  const worksHref = home ? '#archive' : '/#archive'
  const aboutHref = home ? '#about' : '/#about'
  const contactHref = home ? '#contact' : '/#contact'
  const navRef = useRef(null)

  useEffect(() => {
    const el = navRef.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      const snap = () => {
        el.style.setProperty('--gs', String(Math.min(1, window.scrollY / 160)))
      }
      snap()
      window.addEventListener('scroll', snap, { passive: true })
      return () => window.removeEventListener('scroll', snap)
    }

    const target = { x: 0.52, y: 0.3, s: 0 }
    const cur = { x: 0.52, y: 0.3, s: 0 }
    let raf = 0

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      target.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / Math.max(rect.width, 1)))
      target.y = Math.min(1, Math.max(0, (e.clientY - rect.top) / Math.max(rect.height, 1)))
    }

    const onScroll = () => {
      target.s = Math.min(1, window.scrollY / 160)
    }

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.07
      cur.y += (target.y - cur.y) * 0.07
      cur.s += (target.s - cur.s) * 0.16
      el.style.setProperty('--gx', `${(cur.x * 100).toFixed(2)}%`)
      el.style.setProperty('--gy', `${(cur.y * 100).toFixed(2)}%`)
      el.style.setProperty('--gs', cur.s.toFixed(3))
      raf = requestAnimationFrame(tick)
    }

    onScroll()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header className="nav" ref={navRef}>
      <div className="nav-glass">
        <Link to="/" className="nav-mark" aria-label="Yi Wang">
          <span>Y</span>
          <span>W</span>
        </Link>
        <nav className="nav-links">
          {!home && <Link to="/">{lang === 'zh' ? '首页' : 'Home'}</Link>}
          <a href={worksHref}>{lang === 'zh' ? '作品' : 'Works'}</a>
          <a href={aboutHref}>{lang === 'zh' ? '关于' : 'About'}</a>
        </nav>
        <div className="nav-end">
          <a href={contactHref} className="nav-cta">
            {lang === 'zh' ? '联系' : 'Contact'}
          </a>
          <button type="button" className="lang" onClick={toggle} aria-label="Switch language">
            <span className={lang === 'zh' ? 'on' : ''}>ZH</span>
            <span>/</span>
            <span className={lang === 'en' ? 'on' : ''}>EN</span>
          </button>
        </div>
      </div>
    </header>
  )
}
