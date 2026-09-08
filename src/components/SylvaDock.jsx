import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToId } from '../lib/scroll.js'

const ITEMS = [
  { key: 'mark', id: 'top', label: 'Home', mark: true },
  { key: 'grove', id: 'top', label: 'Grove' },
  { key: 'habitats', id: 'directory', label: 'Habitats' },
  { key: 'journal', id: 'series', label: 'Journal' },
  { key: 'enter', id: 'contact', label: 'Enter', enter: true },
]

function sectionKey() {
  const line = Math.max(96, window.innerHeight * 0.28)
  const hits = [
    ['grove', 'top'],
    ['grove', 'persona'],
    ['habitats', 'directory'],
    ['journal', 'series'],
    ['journal', 'archive'],
    ['enter', 'about'],
    ['enter', 'contact'],
  ]
  let current = 'grove'
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
  const [active, setActive] = useState(home ? 'grove' : 'journal')

  const go = (key, id) => (event) => {
    event.preventDefault()
    setActive(key === 'mark' ? 'grove' : key)
    if (home) scrollToId(id)
    else navigate(`/#${id}`)
  }

  useEffect(() => {
    if (!home) {
      setActive('journal')
      return
    }
    const probe = () => setActive(sectionKey())
    probe()
    window.addEventListener('scroll', probe, { passive: true })
    window.addEventListener('resize', probe)
    return () => {
      window.removeEventListener('scroll', probe)
      window.removeEventListener('resize', probe)
    }
  }, [home])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const items = [...root.querySelectorAll('[data-dock]')]
    const states = items.map(() => ({ v: 0, vel: 0, target: 0, cx: 0 }))
    let aimX = 0
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
        return
      }
      states.forEach((s) => {
        const prox = clamp01(1 - Math.abs(aimX - s.cx) / 96)
        s.target = prox * prox * (3 - 2 * prox)
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
      if (moving || hovering) {
        raf = requestAnimationFrame(tick)
        return
      }
      running = false
      items.forEach((el) => {
        el.dataset.near = 'false'
        el.style.transform = ''
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
      aimX = e.clientX
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

  return (
    <div className="site-dock-wrap">
      <nav className="site-dock" ref={rootRef} data-spec aria-label="Primary">
        {ITEMS.map((item) => (
          <a
            key={item.key}
            className={`dock-item${item.mark ? ' dock-mark' : ''}${item.enter ? ' dock-item--enter' : ''}${!item.mark && active === item.key ? ' is-active' : ''}`}
            data-dock
            data-spec
            href={home ? `#${item.id}` : `/#${item.id}`}
            aria-label={item.mark ? 'Home' : item.label}
            onClick={go(item.key, item.id)}
          >
            {item.mark ? (
              <svg viewBox="0 0 22 24" aria-hidden="true">
                <path d="M11 1.3c-2.1 0-3.95 1.2-4.75 2.95C3.95 4.55 2.3 6.25 2.3 8.35c0 2.3 1.9 4.2 4.3 4.2h8.8c2.4 0 4.3-1.9 4.3-4.2 0-2.1-1.65-3.8-4-4.1C14.95 2.5 13.1 1.3 11 1.3Z" />
                <path d="M9.6 12.55h2.8v4.2c1.35.3 2.45 1.15 3.15 2.4-1.35.4-2.4.15-3.15-.4v4.15H9.6v-4.15c-.75.55-1.8.8-3.15.4.7-1.25 1.8-2.1 3.15-2.4v-4.2Z" />
              </svg>
            ) : (
              <>
                <span className="glyph" aria-hidden="true">
                  {item.key === 'grove' && (
                    <svg viewBox="0 0 16 16"><path d="M8 14V9" /><path d="M8 9c0-2.4 1.7-4.3 4-4.3.2 2.6-1.6 4.6-4 4.3Z" /><path d="M8 10.5C7.9 8.4 6.4 6.8 4.4 6.8 4.3 8.9 5.9 10.6 8 10.5Z" /></svg>
                  )}
                  {item.key === 'habitats' && (
                    <svg viewBox="0 0 16 16"><path d="M1.6 12.4c2.4-3.4 4.3-5.1 5.7-5.1 2 0 3 3.6 5 3.6 1.1 0 1.9-.5 2.4-1.4" /><path d="M4.3 6.2C5.5 4.4 6.6 3.5 7.6 3.5c1.5 0 2.2 2.4 3.7 2.4" /></svg>
                  )}
                  {item.key === 'journal' && (
                    <svg viewBox="0 0 16 16"><path d="M4 2.4h5.3L12 5.1v8.5H4z" /><path d="M9.2 2.4V5h2.7" /><path d="M6 8.4h4M6 10.8h2.8" /></svg>
                  )}
                  {item.key === 'enter' && (
                    <svg viewBox="0 0 16 16"><path d="M6.6 2.5h5.1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6.6" /><path d="M2.6 8h6.6" /><path d="m7 5.6 2.4 2.4L7 10.4" /></svg>
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
