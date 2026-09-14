import { useEffect, useRef, useState } from 'react'
import { chips } from '../data/works.js'
import { useLang } from '../i18n.jsx'
import { isJumping, personaViewProgress } from '../lib/scroll.js'
import SylvaHero from './SylvaHero.jsx'

function PersonaCopy({ lang, t, pick, decorative = false }) {
  return (
    <>
      <p className="persona-kicker">{t('persona')}</p>
      <div className="hero-grid">
        <div className="persona-bio">
          <p>{t('personaBio1')}</p>
          <p>{t('personaBio2')}</p>
          <p>{t('personaBio3')}</p>
        </div>
        <ul className="chips">
          {chips.map((c) => (
            <li key={c.en}>{pick(c)}</li>
          ))}
        </ul>

        <figure className="hero-photo">
          <img src="/images/portrait.jpg?v=4" alt={decorative ? '' : lang === 'zh' ? '沐匀' : 'Mu Yun'} />
          <figcaption className="hero-photo-meta">
            <p className="hero-role">{t('role')}</p>
            <span className="hero-photo-dot" aria-hidden="true">
              ·
            </span>
            <p className="hero-cn">{lang === 'zh' ? '沐匀' : 'Mu Yun'}</p>
          </figcaption>
        </figure>
      </div>
    </>
  )
}

export default function Hero() {
  const { lang, t, pick } = useLang()
  const rootRef = useRef(null)
  const [cueOn, setCueOn] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('is-over-sylva')
    return () => document.documentElement.classList.remove('is-over-sylva')
  }, [])

  useEffect(() => {
    let shown = false
    const sync = () => {
      const atTop = window.scrollY < 48
      setCueOn(shown && atTop)
    }
    const onSylva = (event) => {
      if (event.data?.type !== 'yw-sylva-scene' && event.data?.type !== 'yw-sylva-quiet') return
      shown = true
      sync()
    }
    const fallback = window.setTimeout(() => {
      shown = true
      sync()
    }, 2400)
    window.addEventListener('message', onSylva)
    window.addEventListener('scroll', sync, { passive: true })
    sync()
    return () => {
      window.clearTimeout(fallback)
      window.removeEventListener('message', onSylva)
      window.removeEventListener('scroll', sync)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    let raf = 0
    const target = { x: 0, y: 0, pe: 0, px: 0, pv: 0, pk: 1, pky: 40 }
    const cur = { x: 0, y: 0, pe: 0, px: 0, pv: 0, pk: 1, pky: 40 }

    const clamp = (n, a, b) => Math.min(b, Math.max(a, n))
    const range = (v, a, b) => clamp((v - a) / (b - a), 0, 1)

    const readReveal = () => personaViewProgress()

    const readKicker = (card, rect, vh) => {
      if (reduce) {
        target.pk = 0
        target.pky = 0
        return
      }
      const visTop = Math.max(rect.top, 0)
      const visBot = Math.min(rect.bottom, vh)
      const visH = Math.max(0, visBot - visTop)
      const fullH = Math.max(1, Math.min(rect.height, vh))
      target.pk = window.scrollY < 24 ? 1 : 1 - range(visH / fullH, 0.28, 0.97)
      const copy = card.querySelector('.persona-copy:not(.persona-copy--glow)')
      const cr = (copy || card).getBoundingClientRect()
      target.pky = (visTop + visBot) / 2 - cr.top + 10
    }

    const readPersona = () => {
      const card = root.querySelector('.persona-glass')
      if (!card) return
      const rect = card.getBoundingClientRect()
      const vh = window.innerHeight
      const view = readReveal()
      target.pe = view
      target.pv = view
      target.px = 1 - range(rect.bottom, vh * 0.14, vh * 0.58)
      readKicker(card, rect, vh)
      card.style.pointerEvents = cur.px > 0.72 || cur.pv < 0.45 ? 'none' : 'auto'
    }

    const glow = { on: false, cx: 0, cy: 0 }
    let tiltActive = false

    const setGlow = (card, clientX, clientY, on) => {
      glow.on = on
      glow.cx = clientX
      glow.cy = clientY
      if (!card) return
      if (!on) {
        card.classList.remove('is-text-glow')
        return
      }
      const rect = (card.querySelector('.persona-copy--glow') || card).getBoundingClientRect()
      card.style.setProperty('--glow-x', `${(clientX - rect.left).toFixed(1)}px`)
      card.style.setProperty('--glow-y', `${(clientY - rect.top).toFixed(1)}px`)
      card.style.setProperty('--glow-vx', `${clientX.toFixed(1)}px`)
      card.style.setProperty('--glow-vy', `${clientY.toFixed(1)}px`)
      card.classList.add('is-text-glow')
    }

    const onMove = (e) => {
      // Only update mouse pos for card tilt while clicking (tiltActive handles that)
      // onMove still tracks glow on hover
      const card = root.querySelector('.persona-glass')
      if (card && glow.on) setGlow(card, e.clientX, e.clientY, true)
    }

    let sheenArmed = true
    const runSheen = () => {
      if (reduce) return
      const card = root.querySelector('.persona-glass')
      if (!card) return
      sheenArmed = false
      card.classList.remove('is-sheen')
      requestAnimationFrame(() => card.classList.add('is-sheen'))
    }

    const apply = () => {
      root.style.setProperty('--mx', cur.x.toFixed(4))
      root.style.setProperty('--my', cur.y.toFixed(4))
      root.style.setProperty('--pe', cur.pe.toFixed(3))
      root.style.setProperty('--px', cur.px.toFixed(3))
      root.style.setProperty('--pv', cur.pv.toFixed(3))
      root.style.setProperty('--pk', cur.pk.toFixed(3))
      root.style.setProperty('--pky', `${cur.pky.toFixed(1)}px`)
      root.style.setProperty('--tilt', (tiltActive && cur.px < 0.5 ? 1 : 0).toFixed(3))
      const glass = root.querySelector('.persona-glass')
      if (glass) {
        const g = glass.getBoundingClientRect()
        root.style.setProperty('--cue-x', `${(g.left + g.width / 2).toFixed(1)}px`)
      }
    }

    let holdScan = true
    const onSylva = (event) => {
      if (event.data?.type === 'yw-sylva-quiet') holdScan = false
    }
    window.addEventListener('message', onSylva)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (isJumping()) {
        const view = readReveal()
        target.pe = view
        target.pv = view
        const card = root.querySelector('.persona-glass')
        if (card) {
          const rect = card.getBoundingClientRect()
          readKicker(card, rect, window.innerHeight)
        }
      } else {
        readPersona()
      }
      const snapKicker = holdScan && window.scrollY < 80
      if (snapKicker) {
        cur.pk = target.pk
        cur.pky = target.pky
        apply()
        return
      }
      if (window.scrollY < 40 && cur.pe < 0.04 && target.pe < 0.04) {
        cur.pk += (target.pk - cur.pk) * (reduce ? 1 : 0.22)
        cur.pky += (target.pky - cur.pky) * (reduce ? 1 : 0.22)
        apply()
        return
      }
      const k = reduce ? 1 : 0.12
      const m = reduce ? 1 : 0.055
      cur.x += (target.x - cur.x) * m
      cur.y += (target.y - cur.y) * m
      cur.pe += (target.pe - cur.pe) * (reduce ? 1 : 0.22)
      cur.px += (target.px - cur.px) * k
      cur.pv += (target.pv - cur.pv) * (reduce ? 1 : 0.22)
      cur.pk += (target.pk - cur.pk) * (reduce ? 1 : 0.22)
      cur.pky += (target.pky - cur.pky) * (reduce ? 1 : 0.22)
      if (glow.on && !isJumping()) {
        const card = root.querySelector('.persona-glass')
        if (card) setGlow(card, glow.cx, glow.cy, true)
      }
      if (!reduce && !isJumping()) {
        if (cur.pv > 0.96 && sheenArmed) runSheen()
        if (cur.pv < 0.22) sheenArmed = true
      }
      apply()
    }

    readPersona()
    cur.pk = target.pk
    cur.pky = target.pky
    apply()
    window.addEventListener('yw-persona-sheen', runSheen)

    const card = root.querySelector('.persona-glass')

    // Click-activated 3D tilt: press to tilt toward cursor, release to snap back
    const onTiltDown = (e) => {
      if (!card) return
      tiltActive = true
      card.classList.add('is-parallax')
      const r = card.getBoundingClientRect()
      const cx = e.clientX - (r.left + r.width / 2)
      const cy = e.clientY - (r.top + r.height / 2)
      card.style.setProperty('--parx', (cx / (r.width / 2)).toFixed(4))
      card.style.setProperty('--pary', (cy / (r.height / 2)).toFixed(4))
      // Also drive the card-level tilt via --mx/--my
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onTiltMove = (e) => {
      if (!tiltActive || !card) return
      const r = card.getBoundingClientRect()
      const cx = e.clientX - (r.left + r.width / 2)
      const cy = e.clientY - (r.top + r.height / 2)
      card.style.setProperty('--parx', (cx / (r.width / 2)).toFixed(4))
      card.style.setProperty('--pary', (cy / (r.height / 2)).toFixed(4))
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onTiltUp = () => {
      if (!tiltActive || !card) return
      tiltActive = false
      card.classList.remove('is-parallax')
      card.style.setProperty('--parx', '0')
      card.style.setProperty('--pary', '0')
      // Reset card tilt to center
      target.x = 0
      target.y = 0
    }

    if (card) {
      card.addEventListener('pointerdown', onTiltDown)
      window.addEventListener('pointermove', onTiltMove)
      window.addEventListener('pointerup', onTiltUp)
      window.addEventListener('pointercancel', onTiltUp)
    }

    if (fine && !reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      const onGlowMove = (e) => setGlow(card, e.clientX, e.clientY, true)
      const onGlowLeave = () => setGlow(card, 0, 0, false)
      if (card) {
        card.addEventListener('pointerenter', onGlowMove)
        card.addEventListener('pointermove', onGlowMove)
        card.addEventListener('pointerleave', onGlowLeave)
      }
      raf = requestAnimationFrame(tick)
      return () => {
        window.removeEventListener('message', onSylva)
        window.removeEventListener('yw-persona-sheen', runSheen)
        window.removeEventListener('pointermove', onMove)
        if (card) {
          card.removeEventListener('pointerenter', onGlowMove)
          card.removeEventListener('pointermove', onGlowMove)
          card.removeEventListener('pointerleave', onGlowLeave)
          card.removeEventListener('pointerdown', onTiltDown)
        }
        window.removeEventListener('pointermove', onTiltMove)
        window.removeEventListener('pointerup', onTiltUp)
        window.removeEventListener('pointercancel', onTiltUp)
        cancelAnimationFrame(raf)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('message', onSylva)
      window.removeEventListener('yw-persona-sheen', runSheen)
      window.removeEventListener('pointermove', onMove)
      if (card) {
        card.removeEventListener('pointerdown', onTiltDown)
      }
      window.removeEventListener('pointermove', onTiltMove)
      window.removeEventListener('pointerup', onTiltUp)
      window.removeEventListener('pointercancel', onTiltUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="hero is-sylva" id="top" ref={rootRef}>
      <div className="sylva-frame">
        <SylvaHero />
        <div className={`hero-mouse sylva-scroll${cueOn ? ' is-on' : ''}`} aria-hidden="true">
          <span className="hero-mouse-body">
            <span className="hero-mouse-wheel" />
          </span>
          <span className="hero-mouse-label">{t('scrollHint')}</span>
        </div>
      </div>

      <div className="persona" id="persona">
        <div className="persona-deck" aria-hidden="true">
          <div className="persona-ghost persona-ghost--lf">
            <i /><i /><i /><i />
          </div>
          <div className="persona-ghost persona-ghost--lm">
            <i /><i /><i /><i />
          </div>
          <div className="persona-ghost persona-ghost--ln">
            <i /><i /><i /><i />
          </div>
          <div className="persona-ghost persona-ghost--rn">
            <i /><i /><i /><i />
          </div>
          <div className="persona-ghost persona-ghost--rm">
            <i /><i /><i /><i />
          </div>
          <div className="persona-ghost persona-ghost--rf">
            <i /><i /><i /><i />
          </div>
        </div>
        <div className="persona-glass">
          <div className="persona-veil" aria-hidden="true" />
          <div className="persona-sheen" aria-hidden="true">
            <span className="persona-sheen-bar" />
          </div>
          <div className="persona-copy-stack">
            <div className="persona-copy">
              <PersonaCopy lang={lang} t={t} pick={pick} />
            </div>
            <div className="persona-copy persona-copy--glow" aria-hidden="true" inert>
              <PersonaCopy lang={lang} t={t} pick={pick} decorative />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
