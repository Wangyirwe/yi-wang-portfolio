import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { scrollToId } from '../lib/scroll.js'

const NAV_SECTIONS = [
  { key: 'intro', ids: ['persona'] },
  { key: 'catalog', ids: ['directory'] },
  { key: 'works', ids: ['series', 'archive'] },
  { key: 'about', ids: ['about', 'contact'] },
]

function sectionInView() {
  const line = Math.max(96, window.innerHeight * 0.26)
  let current = ''
  for (const item of NAV_SECTIONS) {
    for (const id of item.ids) {
      const el = document.getElementById(id)
      if (!el) continue
      if (el.getBoundingClientRect().top <= line) current = item.key
    }
  }
  return current
}

export default function Nav() {
  const { lang, toggle } = useLang()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const home = pathname === '/'
  const [active, setActive] = useState(home ? '' : 'works')
  const lockUntil = useRef(0)

  const select = (key) => {
    lockUntil.current = Date.now() + 1100
    setActive(key)
  }

  const go = (key, id) => (e) => {
    e.preventDefault()
    select(key)
    if (home) scrollToId(id)
    else navigate(`/#${id}`)
  }
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

  useEffect(() => {
    if (!home) {
      setActive('works')
      return
    }

    const probe = () => {
      if (Date.now() < lockUntil.current) return
      setActive(sectionInView())
    }
    probe()
    window.addEventListener('scroll', probe, { passive: true })
    window.addEventListener('resize', probe)
    return () => {
      window.removeEventListener('scroll', probe)
      window.removeEventListener('resize', probe)
    }
  }, [home])

  return (
    <header className="nav" ref={navRef}>
      <div className="nav-glass">
        <Link
          to="/#top"
          className="nav-mark"
          aria-label="Mu Yun"
          onClick={(e) => {
            e.preventDefault()
            select('')
            if (home) scrollToId('top')
            else navigate('/#top')
          }}
        >
          <span>M</span>
          <span className="nav-mark-y">y</span>
        </Link>
        <nav className="nav-links">
          {!home && <Link to="/">{lang === 'zh' ? '首页' : 'Home'}</Link>}
          <a href={introHref} className={active === 'intro' ? 'is-active' : ''} aria-current={active === 'intro' ? 'true' : undefined} onClick={go('intro', 'persona')}>
            {lang === 'zh' ? '介绍' : 'Intro'}
          </a>
          <a href={catalogHref} className={active === 'catalog' ? 'is-active' : ''} aria-current={active === 'catalog' ? 'true' : undefined} onClick={go('catalog', 'directory')}>
            {lang === 'zh' ? '目录' : 'Catalog'}
          </a>
          <a href={worksHref} className={active === 'works' ? 'is-active' : ''} aria-current={active === 'works' ? 'true' : undefined} onClick={go('works', 'series')}>
            {lang === 'zh' ? '作品' : 'Works'}
          </a>
          <a href={aboutHref} className={active === 'about' ? 'is-active' : ''} aria-current={active === 'about' ? 'true' : undefined} onClick={go('about', 'about')}>
            {lang === 'zh' ? '关于' : 'About'}
          </a>
        </nav>
        <div className="nav-end">
          <a href={contactHref} className="nav-cta" onClick={go('about', 'contact')}>
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
