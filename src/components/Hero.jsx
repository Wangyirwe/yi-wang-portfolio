import { useEffect, useRef, useState } from 'react'
import { chips } from '../data/works.js'
import { useLang } from '../i18n.jsx'
import { isJumping } from '../lib/scroll.js'
import ParticleText from './ParticleText.jsx'

const HERO_PARTICLES = {
  particleSize: 1.8,
  density: 6,
  color: '#ece8df',
  highlightColor: '#d4ccc0',
  scatter: 80,
  gatherDuration: 1400,
  stagger: 280,
  pointerRepel: 28,
  repelRadius: 90,
  idleDrift: 0.25,
  trigger: 'mount',
  fontSize: '1em',
  fontWeight: 700,
  fontFamily: 'inherit',
  glow: false,
}

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
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const root = rootRef.current
    if (!video || !root) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true

    const tryPlay = () => {
      if (isJumping() || document.hidden) return
      const play = video.play()
      if (play) play.catch(() => {})
    }

    const onReady = () => {
      setReady(true)
      tryPlay()
    }

    video.addEventListener('loadeddata', onReady)
    video.addEventListener('canplay', tryPlay)
    if (video.readyState >= 2) onReady()
    tryPlay()

    const onVisible = () => {
      if (document.hidden) video.pause()
      else tryPlay()
    }
    document.addEventListener('visibilitychange', onVisible)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (isJumping()) return
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) tryPlay()
        else video.pause()
      },
      { threshold: [0, 0.35, 0.6] },
    )
    const intro = root.querySelector('.hero-intro')
    io.observe(intro || root)

    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const target = { x: 0, y: 0, pe: 0, px: 0 }
    const cur = { x: 0, y: 0, pe: 0, px: 0 }

    const clamp = (n, a, b) => Math.min(b, Math.max(a, n))
    const range = (v, a, b) => clamp((v - a) / (b - a), 0, 1)

    const readPersona = () => {
      const card = root.querySelector('.persona-glass')
      if (!card) return
      const rect = card.getBoundingClientRect()
      const vh = window.innerHeight
      target.pe = range(rect.top, vh * 0.78, vh * 0.16)
      target.px = 1 - range(rect.bottom, vh * 0.14, vh * 0.58)
      card.style.pointerEvents = cur.px > 0.72 ? 'none' : 'auto'
    }

    const glow = { on: false, cx: 0, cy: 0 }

    const setGlow = (card, clientX, clientY, on) => {
      glow.on = on
      glow.cx = clientX
      glow.cy = clientY
      if (!card) return
      if (!on) {
        card.classList.remove('is-text-glow')
        return
      }
      const layer = card.querySelector('.persona-copy--glow')
      const rect = (layer || card).getBoundingClientRect()
      card.style.setProperty('--glow-x', `${(clientX - rect.left).toFixed(1)}px`)
      card.style.setProperty('--glow-y', `${(clientY - rect.top).toFixed(1)}px`)
      card.style.setProperty('--glow-vx', `${clientX.toFixed(1)}px`)
      card.style.setProperty('--glow-vy', `${clientY.toFixed(1)}px`)
      card.classList.add('is-text-glow')
    }

    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      target.x = x
      target.y = y
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

    const playSheen = () => {
      if (reduce || isJumping()) return
      const card = root.querySelector('.persona-glass')
      if (!card) return
      if (cur.pe > 0.86 && sheenArmed) runSheen()
      if (cur.pe < 0.16) sheenArmed = true
    }

    const apply = () => {
      root.style.setProperty('--mx', cur.x.toFixed(4))
      root.style.setProperty('--my', cur.y.toFixed(4))
      root.style.setProperty('--pe', cur.pe.toFixed(3))
      root.style.setProperty('--px', cur.px.toFixed(3))
    }

    const tick = () => {
      if (!isJumping()) readPersona()
      const k = reduce ? 1 : 0.12
      const m = reduce ? 1 : 0.055
      cur.x += (target.x - cur.x) * m
      cur.y += (target.y - cur.y) * m
      cur.pe += (target.pe - cur.pe) * k
      cur.px += (target.px - cur.px) * k
      if (glow.on && !isJumping()) {
        const card = root.querySelector('.persona-glass')
        if (card) setGlow(card, glow.cx, glow.cy, true)
      }
      playSheen()
      apply()
      raf = requestAnimationFrame(tick)
    }

    readPersona()
    if (reduce) {
      cur.pe = target.pe
      cur.px = target.px
      apply()
    }
    window.addEventListener('yw-persona-sheen', runSheen)
    window.addEventListener('yw-hero-resume', tryPlay)

    if (fine && !reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      const card = root.querySelector('.persona-glass')
      const onGlowMove = (e) => setGlow(card, e.clientX, e.clientY, true)
      const onGlowLeave = () => setGlow(card, 0, 0, false)
      if (card) {
        card.addEventListener('pointerenter', onGlowMove)
        card.addEventListener('pointermove', onGlowMove)
        card.addEventListener('pointerleave', onGlowLeave)
      }
      raf = requestAnimationFrame(tick)

      return () => {
        video.removeEventListener('loadeddata', onReady)
        video.removeEventListener('canplay', tryPlay)
        document.removeEventListener('visibilitychange', onVisible)
        io.disconnect()
        window.removeEventListener('yw-persona-sheen', runSheen)
        window.removeEventListener('yw-hero-resume', tryPlay)
        window.removeEventListener('pointermove', onMove)
        if (card) {
          card.removeEventListener('pointerenter', onGlowMove)
          card.removeEventListener('pointermove', onGlowMove)
          card.removeEventListener('pointerleave', onGlowLeave)
        }
        cancelAnimationFrame(raf)
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', tryPlay)
      document.removeEventListener('visibilitychange', onVisible)
      io.disconnect()
      window.removeEventListener('yw-persona-sheen', runSheen)
      window.removeEventListener('yw-hero-resume', tryPlay)
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className={`hero is-film ${ready ? 'is-ready' : ''}`} id="top" ref={rootRef}>
      <div className="hero-stage" aria-hidden="true">
        <div className="hero-video-frame">
          <video
            ref={videoRef}
            className="hero-video"
            src="/video/hero-clean.mp4"
            poster="/images/time-snack/three-quarter.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="hero-wm-hide" />
        </div>
        <div className="hero-dim" />
        <div className="hero-grain" />
        <div className="hero-vignette" />
      </div>

      <div className="hero-intro">
        <div className="hero-meta">
          <p className="kicker">{t('heroKicker')}</p>
          <p className="status">{t('status')}</p>
        </div>

        <div className="hero-theme">
          <h1 className="hero-theme-title">
            <ParticleText text={'DESIGN\nSTUDIO'} {...HERO_PARTICLES} />
          </h1>
          <div className="hero-mouse">
            <span className="hero-mouse-body" aria-hidden="true">
              <span className="hero-mouse-wheel" />
            </span>
            <span className="hero-mouse-label">{t('scrollHint')}</span>
          </div>
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
          <div className="persona-copy">
            <PersonaCopy lang={lang} t={t} pick={pick} />
          </div>
          <div className="persona-copy persona-copy--glow" aria-hidden="true" inert>
            <PersonaCopy lang={lang} t={t} pick={pick} decorative />
          </div>
        </div>
      </div>
    </section>
  )
}
