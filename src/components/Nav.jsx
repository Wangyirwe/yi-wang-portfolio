import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../i18n.jsx'

export default function Nav() {
  const { lang, toggle } = useLang()
  const { pathname } = useLocation()
  const home = pathname === '/'
  const introHref = home ? '#persona' : '/#persona'
  const catalogHref = home ? '#directory' : '/#directory'
  const worksHref = home ? '#series' : '/#series'
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

    let target = 0
    let cur = 0
    let raf = 0

    const onScroll = () => {
      target = Math.min(1, window.scrollY / 160)
    }

    const tick = () => {
      cur += (target - cur) * 0.16
      el.style.setProperty('--gs', cur.toFixed(3))
      raf = requestAnimationFrame(tick)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header className="nav" ref={navRef}>
      <div className="nav-glass">
        <Link
          to="/#top"
          className="nav-mark"
          aria-label="Mu Yun"
          onClick={(e) => {
            if (!home) return
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
            window.history.replaceState(null, '', '/#top')
          }}
        >
          <span>M</span>
          <span className="nav-mark-y">y</span>
        </Link>
        <nav className="nav-links">
          {!home && <Link to="/">{lang === 'zh' ? '首页' : 'Home'}</Link>}
          <a href={introHref}>{lang === 'zh' ? '介绍' : 'Intro'}</a>
          <a href={catalogHref}>{lang === 'zh' ? '目录' : 'Catalog'}</a>
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
