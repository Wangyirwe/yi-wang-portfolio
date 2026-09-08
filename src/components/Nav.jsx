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
  const [active, setActive] = useState(home ? 'intro' : 'works')
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

    const frost = el.querySelector('.nav-frost')
    const keys = ['.nav-mark', '.nav-links', '.nav-cta', '.lang']
    const STICK = 52
    const NECK = 24
    const UNION = 0.86

    const placeBlob = (node, x, y, width, height, opacity) => {
      if (!node) return
      if (opacity <= 0.02 || width < 2 || height < 2) {
        node.style.opacity = '0'
        return
      }
      node.style.opacity = String(opacity)
      node.style.width = `${width}px`
      node.style.height = `${height}px`
      node.style.transform = `translate(${x}px, ${y}px)`
    }

    const syncBlobs = () => {
      const samples = keys.map((sel) => {
        const source = el.querySelector(sel)
        if (!source) return null
        return source.getBoundingClientRect()
      }).filter(Boolean)

      const visible = samples.filter((box) => box.width >= 2 && box.height >= 2)
      const maxH = Math.max(0, ...visible.map((box) => box.height))
      const ordered = [...visible].sort((a, b) => a.left - b.left)
      let maxGap = 999
      if (ordered.length >= 2) {
        maxGap = 0
        for (let i = 0; i < ordered.length - 1; i += 1) {
          maxGap = Math.max(maxGap, ordered[i + 1].left - ordered[i].right)
        }
      }

      if (frost) {
        const origin = frost.getBoundingClientRect()
        const gooAmt = Number(el.style.getPropertyValue('--goo') || 0)
        const unionAmt = Math.min(1, Math.max(0, (gooAmt - UNION) / (1 - UNION)))
        const pairU = []
        for (let i = 0; i < ordered.length - 1; i += 1) {
          const gap = ordered[i + 1].left - ordered[i].right
          const t = Math.min(1, Math.max(0, (NECK - gap) / NECK))
          pairU[i] = t * t * (3 - 2 * t)
        }

        const clustered = new Set()
        const clusters = []
        let start = 0
        for (let i = 0; i < ordered.length; i += 1) {
          const linked = i < ordered.length - 1 && pairU[i] > 0.1
          if (linked) continue
          if (i > start) {
            clusters.push({ from: start, to: i, strength: Math.max(...pairU.slice(start, i)) })
            for (let k = start; k <= i; k += 1) clustered.add(ordered[k])
          }
          start = i + 1
        }

        frost.querySelectorAll('.nav-pill').forEach((blob, i) => {
          const box = samples[i]
          if (!box || box.width < 2 || box.height < 2 || clustered.has(box) || unionAmt > 0.02) {
            blob.style.opacity = '0'
            return
          }
          const height = Math.max(box.height, maxH)
          placeBlob(
            blob,
            box.left - origin.left,
            box.top - origin.top - (height - box.height) / 2,
            box.width,
            height,
            1,
          )
        })

        frost.querySelectorAll('.nav-neck').forEach((neck, i) => {
          const cluster = clusters[i]
          if (!cluster || unionAmt > 0.02) {
            neck.style.opacity = '0'
            return
          }
          const a = ordered[cluster.from]
          const b = ordered[cluster.to]
          const height = maxH
          const top = Math.min(a.top + (a.height - height) / 2, b.top + (b.height - height) / 2)
          placeBlob(
            neck,
            a.left - origin.left,
            top - origin.top,
            Math.max(2, b.right - a.left),
            height,
            1,
          )
        })

        const union = frost.querySelector('.nav-union')
        if (union && ordered.length) {
          const left = ordered[0].left
          const right = ordered[ordered.length - 1].right
          const top = Math.min(...ordered.map((box) => box.top + (box.height - maxH) / 2))
          placeBlob(union, left - origin.left, top - origin.top, Math.max(2, right - left), maxH, unionAmt)
        }
      }

      return maxGap
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const applyGs = (value) => {
      el.style.setProperty('--gs', value.toFixed(3))
      el.style.setProperty('--pull', `${(value * -10).toFixed(1)}px`)
      const gap = syncBlobs()
      const t = reduce ? (value >= 1 ? 1 : 0) : Math.min(1, Math.max(0, (STICK - gap) / STICK))
      const gooAmt = t * t * (3 - 2 * t)
      el.style.setProperty('--goo', gooAmt.toFixed(3))
      if (gooAmt > 0.04) syncBlobs()
    }

    if (reduce) {
      const snap = () => {
        applyGs(Math.min(1, window.scrollY / 160))
      }
      snap()
      window.addEventListener('scroll', snap, { passive: true })
      window.addEventListener('resize', snap)
      return () => {
        window.removeEventListener('scroll', snap)
        window.removeEventListener('resize', snap)
      }
    }

    let target = 0
    let cur = 0
    let raf = 0

    const onScroll = () => {
      target = Math.min(1, window.scrollY / 160)
    }

    const tick = () => {
      cur += (target - cur) * 0.12
      applyGs(cur)
      raf = requestAnimationFrame(tick)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', syncBlobs)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', syncBlobs)
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
      setActive(sectionInView() || 'intro')
    }
    probe()
    window.addEventListener('scroll', probe, { passive: true })
    window.addEventListener('resize', probe)
    return () => {
      window.removeEventListener('scroll', probe)
      window.removeEventListener('resize', probe)
    }
  }, [home])

  useEffect(() => {
    if (!home) {
      document.documentElement.classList.remove('is-over-sylva')
      return
    }
    const frame = document.querySelector('.sylva-frame')
    if (!frame) return
    const io = new IntersectionObserver(
      ([entry]) => {
        const over = entry.isIntersecting && entry.intersectionRatio >= 0.48
        document.documentElement.classList.toggle('is-over-sylva', over)
      },
      { threshold: [0.2, 0.48, 0.7] },
    )
    io.observe(frame)
    return () => {
      io.disconnect()
      document.documentElement.classList.remove('is-over-sylva')
    }
  }, [home])

  return (
    <header className="nav" ref={navRef}>
      <div className="nav-glass">
        <div className="nav-frost" aria-hidden="true">
          <span className="nav-blob nav-pill" />
          <span className="nav-blob nav-pill" />
          <span className="nav-blob nav-pill" />
          <span className="nav-blob nav-pill" />
          <span className="nav-blob nav-neck" />
          <span className="nav-blob nav-neck" />
          <span className="nav-blob nav-neck" />
          <span className="nav-blob nav-union" />
        </div>
        <div className="nav-ui">
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
            {'My'}
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
      </div>
    </header>
  )
}
