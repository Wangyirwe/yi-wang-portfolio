import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isJumping, scrollToId } from '../lib/scroll.js'

const ITEMS = [
  { key: 'mark', id: 'top', label: '首页', mark: true },
  { key: 'grove', id: 'persona', label: '介绍' },
  { key: 'habitats', id: 'directory', label: '目录' },
  { key: 'journal', id: 'series', label: '作品' },
  { key: 'enter', id: 'contact', label: '联系', enter: true },
]

function sectionKey() {
  const vh = window.innerHeight
  const line = Math.max(96, vh * 0.32)
  const card = document.querySelector('.persona-glass')
  const groveEl = card || document.getElementById('persona')
  let current = 'mark'
  if (groveEl) {
    const rect = groveEl.getBoundingClientRect()
    const vis = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
    const shown = vis / Math.max(1, Math.min(rect.height, vh))
    if (shown >= 0.48 || rect.top <= vh * 0.58) current = 'grove'
  }
  const hits = [
    ['habitats', 'directory'],
    ['journal', 'series'],
    ['journal', 'archive'],
    ['enter', 'about'],
    ['enter', 'contact'],
  ]
  for (const [key, id] of hits) {
    const el = document.getElementById(id)
    if (!el) continue
    if (el.getBoundingClientRect().top <= line) current = key
  }
  return current
}

export default function SylvaDock() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const home = pathname === '/'
  const rootRef = useRef(null)
  const [active, setActive] = useState(home ? 'mark' : 'journal')

  const go = (key, id) => (event) => {
    event.preventDefault()
    setActive(key)
    if (home) scrollToId(id)
    else navigate(`/#${id}`)
  }

  useEffect(() => {
    if (!home) {
      setActive('journal')
      return
    }
    const probe = () => {
      if (isJumping() || document.documentElement.classList.contains('is-jumping')) return
      setActive(sectionKey())
    }
    probe()
    window.addEventListener('scroll', probe, { passive: true })
    window.addEventListener('resize', probe)
    window.addEventListener('yw-jump-end', probe)
    return () => {
      window.removeEventListener('scroll', probe)
      window.removeEventListener('resize', probe)
      window.removeEventListener('yw-jump-end', probe)
    }
  }, [home])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = [...root.querySelectorAll('[data-dock]')]
    const states = items.map(() => ({ v: 0, vel: 0, target: 0, cx: 0 }))
    const specs = [root, ...items].map((el) => ({
      el,
      ang: 2.4,
      tAng: 2.4,
      br: 0,
      tBr: 0,
      reach: el === root ? 250 : 168,
    }))
    let aimX = 0
    let aimY = 0
    let hovering = false
    let running = false
    let raf = 0
    let last = 0

    const clamp01 = (n) => Math.min(1, Math.max(0, n))

    const measure = () => {
      items.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        states[i].cx = r.left + r.width * 0.5
      })
    }

    const setTargets = () => {
      if (!hovering) {
        states.forEach((s) => {
          s.target = 0
        })
        specs.forEach((s) => {
          s.tBr = 0
        })
        return
      }
      states.forEach((s) => {
        const prox = clamp01(1 - Math.abs(aimX - s.cx) / 96)
        s.target = prox * prox * (3 - 2 * prox)
      })
      specs.forEach((st) => {
        const r = st.el.getBoundingClientRect()
        const cx = r.left + r.width * 0.5
        const cy = r.top + r.height * 0.5
        const dx = Math.max(r.left - aimX, 0, aimX - r.right)
        const dy = Math.max(r.top - aimY, 0, aimY - r.bottom)
        const d = Math.hypot(dx, dy)
        st.tAng =
          d === 0
            ? Math.atan2(2 / Math.max(r.height, 1), -2 / Math.max(r.width, 1)) +
              ((aimX - cx) / Math.max(r.width * 0.5, 1)) * 0.3 +
              ((cy - aimY) / Math.max(r.height * 0.5, 1)) * 0.15
            : Math.atan2(cy - aimY, aimX - cx)
        const raw = clamp01(1 - d / st.reach)
        st.tBr = raw * raw * (3 - 2 * raw)
      })
    }

    const tick = (now) => {
      const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016)
      last = now
      let moving = false
      items.forEach((el, i) => {
        const s = states[i]
        s.vel += (s.target - s.v) * 260 * dt
        s.vel *= Math.exp(-10 * dt)
        s.v += s.vel * dt
        if (Math.abs(s.target - s.v) > 0.003 || Math.abs(s.vel) > 0.01) moving = true
        const v = s.v
        el.dataset.near = hovering && v > 0.18 ? 'true' : 'false'
        el.style.transform = `translate3d(0, ${(v * 5).toFixed(2)}px, 0) scale(${(1 + v * 0.1).toFixed(4)})`
      })
      if (!reduced) {
        specs.forEach((st) => {
          const diff = ((st.tAng - st.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI
          st.ang += diff * (1 - Math.exp(-dt * 8))
          st.br += (st.tBr - st.br) * (1 - Math.exp(-dt * 9))
          if (Math.abs(diff) > 0.001 || Math.abs(st.tBr - st.br) > 0.002) moving = true
          st.el.style.setProperty('--spec-angle', `${st.ang.toFixed(4)}rad`)
          st.el.style.setProperty('--spec-bright', (clamp01(st.br) * 0.96).toFixed(3))
        })
      }
      if (moving || hovering) {
        raf = requestAnimationFrame(tick)
        return
      }
      running = false
      items.forEach((el) => {
        el.dataset.near = 'false'
        el.style.transform = ''
      })
      specs.forEach((st) => {
        st.el.style.setProperty('--spec-bright', '0')
      })
    }

    const start = () => {
      if (running) return
      running = true
      last = 0
      raf = requestAnimationFrame(tick)
    }

    const onEnter = () => {
      hovering = true
      measure()
      setTargets()
      start()
    }

    const onLeave = () => {
      hovering = false
      items.forEach((el) => {
        el.dataset.near = 'false'
      })
      setTargets()
      start()
    }

    const onMove = (e) => {
      if (e.pointerType === 'touch') return
      aimX = e.clientX
      aimY = e.clientY
      if (!hovering) return
      setTargets()
      start()
    }

    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', measure)
      cancelAnimationFrame(raf)
    }
  }, [])

  const [dockedIn, setDockedIn] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDockedIn(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={`site-dock-wrap${dockedIn ? ' is-dock-in' : ''}`}>
      <nav className="site-dock" ref={rootRef} data-spec aria-label="主导航">
        {ITEMS.map((item) => (
          <a
            key={item.key}
            className={`dock-item${item.mark ? ' dock-mark' : ''}${active === item.key ? ' is-active' : ''}`}
            data-dock
            data-spec
            href={home ? `#${item.id}` : `/#${item.id}`}
            aria-label={item.label}
            onClick={go(item.key, item.id)}
          >
            {item.mark ? (
              <span className="dock-mark-icon" aria-hidden="true" />
            ) : (
              <>
                <span className="glyph" aria-hidden="true">
                  {item.key === 'grove' && (
                    <svg viewBox="0 0 16 16"><path d="M5.6 2.6c.28.4.28.85 0 1.25"/><path d="M8 2.2c.28.4.28.85 0 1.25"/><path d="M10.4 2.6c.28.4.28.85 0 1.25"/><path d="M3.8 7.2h7.6v5.2a1.9 1.9 0 0 1-1.9 1.9H5.7A1.9 1.9 0 0 1 3.8 12.4z"/><path d="M11.4 8.4c1.55 0 2.35 1.05 2.35 2.25s-.8 2.25-2.35 2.25"/></svg>
                  )}
                  {item.key === 'habitats' && (
                    <svg viewBox="0 0 16 16"><path d="M1.6 12.4c2.4-3.4 4.3-5.1 5.7-5.1 2 0 3 3.6 5 3.6 1.1 0 1.9-.5 2.4-1.4" /><path d="M4.3 6.2C5.5 4.4 6.6 3.5 7.6 3.5c1.5 0 2.2 2.4 3.7 2.4" /></svg>
                  )}
                  {item.key === 'journal' && (
                    <svg viewBox="0 0 16 16"><path d="M4 2.4h5.3L12 5.1v8.5H4z" /><path d="M9.2 2.4V5h2.7" /><path d="M6 8.4h4M6 10.8h2.8" /></svg>
                  )}
                  {item.key === 'enter' && (
                    <svg viewBox="0 0 16 16"><path d="M2.5 4.3h11v7.4a.9.9 0 0 1-.9.9H3.4a.9.9 0 0 1-.9-.9z" /><path d="M2.5 4.3 8 8.5l5.5-4.2" /></svg>
                  )}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </a>
        ))}
      </nav>
    </div>
  )
}
